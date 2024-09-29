'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config'; 
import './submission.css';
import Link from 'next/link';
import PieChart from './reading/donut_chart';


interface Submission {
  type: string;
  sid: string;
  cid: string;
  contest_title: string;
  correct: string;
  wrong: string;
  empty: string;
  total: string;
  result: Record<string,any>;
  submit_time: string;
  user_answer: Record<string, any>;
  correct_answer: Record<string, any>;
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

export default function ReadingRender() {
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
        <div>{error}</div>
      </>
    );
  }

  if (!submission) {
    return (
      <>
        <div>Loading...</div>
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
      <div className="flex flex-col   p-4 ml-16 mr-16">
        <div className="flex flex-col lg:flex-row justify-between bg-white border border-gray-300 rounded-lg shadow-md p-8">
          <div className="flex flex-col mb-8 lg:mb-0 w-full lg:w-2/3">
            <Link href={`/contests/${submission.cid}`}>
              <p className="text-4xl font-semibold mb-2">
                {submission.contest_title}
              </p>
            </Link>
            <p className="text-lg font-semibold mb-8">
              <p><strong>Submitted Time:</strong> {new Date(submission.submit_time).toLocaleString()}</p>
            </p>

            <div className="flex justify-center lg:justify-start">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl p-6 w-40 h-40 flex flex-col justify-center items-center hover:scale-105 transition-transform duration-300 border border-gray-300">
                  <p className="text-lg text-[#4CAF50] font-semibold uppercase tracking-wide">Correct</p>
                  <p className="text-5xl mt-2 font-bold text-gray-900">{correct}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl p-6 w-40 h-40 flex flex-col justify-center items-center hover:scale-105 transition-transform duration-300 border border-gray-300">
                  <p className="text-lg text-[#f44336] font-semibold uppercase tracking-wide">Incorrect</p>
                  <p className="text-5xl mt-2 font-bold text-gray-900">{wrong}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl p-6 w-40 h-40 flex flex-col justify-center items-center hover:scale-105 transition-transform duration-300 border border-gray-300">
                  <p className="text-lg text-[#E0A806] font-semibold uppercase tracking-wide">Skipped</p>
                  <p className="text-5xl mt-2 font-bold text-gray-900">{skipped}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl p-6 w-40 h-40 flex flex-col justify-center items-center hover:scale-105 transition-transform duration-300 border border-gray-300">
                  <p className="text-lg text-black font-semibold uppercase tracking-wide">Total</p>
                  <p className="text-5xl mt-2 font-bold text-gray-900">{total}</p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center items-center w-full lg:w-1/3 lg:justify-end mt-8 lg:mt-0">
            {/* <Ring correct={correct} incorrect={wrong} skipped={skipped} /> */}
            <PieChart correct={correct} incorrect={wrong} skipped={skipped}/>
          </div>
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
                            : 'border-[#E0A806] text-[#E0A806] hover:bg-gray-100 active:bg-gray-200'
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
                          <i className="ml-2 text-[#FFC107]">Skipped</i>
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
    </div>
  );
}
