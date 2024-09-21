'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config'; 
import './submission.css';

interface RingProps {
  correct: number;
  incorrect: number;
  skipped: number;
}
const Ring: React.FC<RingProps> = ({ correct, incorrect, skipped }) => {
  const total = correct + incorrect + skipped;
  const correctPercentage = (correct / total) * 100 || 0;
  const incorrectPercentage = (incorrect / total) * 100 || 0;
  const skippedPercentage = (skipped / total) * 100 || 0;

  const radius = 120; // Radius
  const strokeWidth = 50; // Stroke width

  const circumference = 2 * Math.PI * radius;
  const correctStrokeDasharray = `${(correctPercentage / 100) * circumference} ${circumference}`;
  const incorrectStrokeDasharray = `${(incorrectPercentage / 100) * circumference} ${circumference}`;
  const skippedStrokeDasharray = `${(skippedPercentage / 100) * circumference} ${circumference}`;
  const band = calculateBand(correct.toString(), total.toString());

  return (
    <div className="flex flex-col items-center">
      <svg width="300" height="300">
        <circle
          cx="150" 
          cy="150" 
          r={radius}
          stroke="#4CAF50" 
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={correctStrokeDasharray}
          strokeDashoffset={0}
        />
        <circle
          cx="150" 
          cy="150" 
          r={radius}
          stroke="#f00" 
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={incorrectStrokeDasharray}
          strokeDashoffset={-correctPercentage * circumference / 100}
        />
        <circle
          cx="150" 
          cy="150" 
          r={radius}
          stroke="#f0f0f0" 
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={skippedStrokeDasharray}
          strokeDashoffset={-(correctPercentage + incorrectPercentage) * circumference / 100}
        />
        <text
          x="150" 
          y="150" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize="24" 
          fill="#000" 
        >
          {band}
        </text>
      </svg>

      {/* Percentage Descriptions */}
      <div className="flex justify-around mt-4">
        <div className="flex items-center">
          <svg width="20" height="20">
            <rect width="20" height="20" fill="#4CAF50" />
          </svg>
          <span className="ml-2 mr-4"> Correct</span>
        </div>
        <div className="flex items-center">
          <svg width="20" height="20">
            <rect width="20" height="20" fill="#f00" />
          </svg>
          <span className="ml-2 mr-4"> Incorrect</span>
        </div>
        <div className="flex items-center">
          <svg width="20" height="20">
            <rect width="20" height="20" fill="#f0f0f0" />
          </svg>
          <span className="ml-2 mr-4"> Skipped</span>
        </div>
      </div>
    </div>
  );
};

interface Submission {
  type: string;
  sid: string;
  cid: string;
  contest_title: string;
  correct: string;
  wrong: string;
  empty: string;
  total: string;
  submit_time: string;
  user_answer: Record<string, any>;
  correct_answer: Record<string, any>;
}

function calculateBand(correct: string, total: string) {
  const correctNum = parseFloat(correct);
  const totalNum = parseFloat(total);

  if (isNaN(correctNum) || isNaN(totalNum) || totalNum === 0) {
    return 0;
  }

  const ratio = correctNum / totalNum;
  const base9Ratio = ratio * 9;
  const roundedBand = Math.round(base9Ratio * 2) / 2;

  return roundedBand;
}

function compareAnswers(
  userAnswer: Record<string, any>, 
  correctAnswer: Record<string, any>
) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let total = 0;
  let result = new Map<number, any[]>();

  for (const paragraphIndex in correctAnswer) {
    if (correctAnswer.hasOwnProperty(paragraphIndex)) {
      const sections = correctAnswer[paragraphIndex];
      for (const sectionIndex in sections) {
        if (sections.hasOwnProperty(sectionIndex)) {
          const questions = sections[sectionIndex];
          for (const questionIndex in questions) {
            if (questions.hasOwnProperty(questionIndex)) {
              total++;
              const correctAns = questions[questionIndex];
              const userAns = userAnswer?.[paragraphIndex]?.[sectionIndex]?.[questionIndex] || '';

              let resultItem = {
                userAns,
                correctAns,
                status: 'skipped' as 'correct' | 'wrong' | 'skipped',  // default to 'skipped'
              };

              if (userAns === '') {
                skipped++;
              } else if (userAns === correctAns.answer) {
                correct++;
                resultItem.status = 'correct';
              } else {
                wrong++;
                resultItem.status = 'wrong';
              }
              if (!result.has(parseInt(paragraphIndex, 10))) {
                result.set(parseInt(paragraphIndex, 10), [resultItem]);
              } else {
                result.get(parseInt(paragraphIndex, 10))?.push(resultItem);
              }
            }
          }
        }
      }
    }
  }

  return { correct, wrong, skipped, total, result };
}

export default function DetailResultPage() {
  const { submissionID } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<[string | null, number]>([null, 0]);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${config.API_BASE_URL}api/getSubmission`,
          { submissionID },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setSubmission(response.data);
      } catch (error) {
        setError('Failed to fetch submission details');
      }
    }

    fetchSubmission();
  }, [submissionID]);

  if (error) {
    return (
      <>
        <Header />
        <div>{error}</div>
        <Footer />
      </>
    );
  }

  if (!submission) {
    return (
      <>
        <Header />
        <div>Loading...</div>
        <Footer />
      </>
    );
  }
  
  const handleAnswer = (paragraph: number, index: number) => {
    const key = `${paragraph}-${index}`;
    setAnswers(prevAnswer => {
      const [prevKey, prevValue] = prevAnswer;

      // If the current key matches, set the value to 0
      if (prevKey === key) {
        return [prevKey, prevValue ? 0 : 1];
      } else {
        // Otherwise, set the key to the new key and value to 1
        return [key, 1];
      }
    });
  };

  const { correct, wrong, skipped, total, result } = compareAnswers(
    submission.user_answer, 
    submission.correct_answer
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col justify-center p-4 ml-16 mr-16">
        <div className="flex flex-col lg:flex-row justify-between bg-white border border-gray-300 rounded-lg shadow-md p-8">
          <div className="flex flex-col">
            <p><strong>Contest Title:</strong> {submission.contest_title}</p>
            <p><strong>Submitted Time:</strong> {submission.submit_time}</p>
            <div className="flex flex-wrap mt-8"> 
              <div className="bg-white rounded-lg shadow-md border border-gray-300 mr-4 mb-4 p-4 w-36 h-36"> 
                <p className='text-center'><strong className='text-2xl text-[#4CAF50]'>Correct</strong></p> 
                <p className='text-center text-4xl mt-2'>{correct}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md border border-gray-300 mr-4 mb-4 p-4 w-36 h-36">
                <p className='text-center'><strong className="text-2xl text-[#f44336]">Incorrect</strong></p>
                <p className='text-center text-4xl mt-2'>{wrong}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md border border-gray-300 mr-4 mb-4 p-4 w-36 h-36">
                <p className='text-center'><strong className='text-2xl text-[#6B7280]'>Skipped</strong></p>
                <p className='text-center text-4xl mt-2'>{skipped}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md border border-gray-300 mr-4 mb-4 p-4 w-36 h-36">
                <p className='text-center'><strong className='text-2xl text-black'>Total</strong></p>
                <p className='text-center text-4xl mt-2'>{total}</p>
              </div>
            </div>
          </div>
          <Ring correct={correct} incorrect={wrong} skipped={skipped} />
        </div>
        <div className='border border-gray-300 shadow-md p-4 rounded-lg mt-4'>
          <h1 className='text-2xl'>Answer Review:</h1>
          {Array.from(result.entries()).map(([paragraphIndex, items], paragraphKey) => (
            <div key={paragraphKey} className="flex flex-col">
              <h2 className='mb-2'>Paragraph {paragraphIndex + 1}</h2>
              <div className="flex">
                {items.map((item, index) => (
                  <div key={`${paragraphKey}-${index}`} className="mr-2"> 
                    <button
                        onClick={() => handleAnswer(paragraphKey, index)}
                        className={`circle ${
                          item.status === 'correct'
                            ? 'border-green-500 text-green-500 hover:bg-green-100 active:bg-green-200'
                            : item.status === 'wrong'
                            ? 'border-red-500 text-red-500 hover:bg-red-100 active:bg-red-200'
                            : 'border-gray-500 text-gray-500 hover:bg-gray-100 active:bg-gray-200'
                        } border-2 transition-colors duration-200 ease-in-out rounded-lg p-2`}
                      >
                        {index + 1}
                      </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 mb-2">
                {items.map((item, index) => (
                  answers[1] === 1 && answers[0] === `${paragraphKey}-${index}` && ( 
                    <div 
                      key={`answers-${index}`} 
                      className='bg-white rounded-lg shadow-md border border-gray-300 mt-1 p-4'
                    >
                      <p>Your answer: 
                        {item.status === 'skipped' ? (
                          <i className="ml-2 text-gray-500">Skipped</i>
                        ) : item.status === 'correct' ? (
                          <span className="ml-2 text-green-500">{item.userAns}</span>
                        ) : (
                          <s className='ml-2 text-red-500'><i>{item.userAns}</i></s>
                        )}
                      </p>
                      {item.status !== 'correct' && (
                        <div>
                          <span>Correct answer:</span>
                          <span className='ml-2 font-black'>{item.correctAns.answer}</span>
                        </div>                          
                      )}
                      {item.correctAns.explanation && (
                        <p>Explanation: <span className="text-black">{item.correctAns.explanation}</span></p>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          ))} 
        </div>
      </div>
      <Footer />
    </div>
  );
}
