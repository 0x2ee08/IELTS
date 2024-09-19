'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config'; 

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
  let empty = 0;
  let total = 0;
  const result: any[] = [];

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
                status: 'empty' as 'correct' | 'wrong' | 'empty',  // default to 'empty'
              };

              if (userAns === '') {
                empty++;
              } else if (userAns === correctAns) {
                correct++;
                resultItem.status = 'correct';
              } else {
                wrong++;
                resultItem.status = 'wrong';
              }

              result.push(resultItem);
            }
          }
        }
      }
    }
  }

  return { correct, wrong, empty, total, result };
}

export default function DetailResultPage() {
  const { submissionID } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${config.API_BASE_URL}api/getSubmission`, {submissionID}, { headers: { 'Authorization': `Bearer ${token}` }} );
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

  const { correct, wrong, empty, total, result } = compareAnswers(
    submission.user_answer, 
    submission.correct_answer
  );

  const band = calculateBand(correct.toString(), total.toString());

  return (
    <>
      <Header />
      <div>
        <h1>Submission Details</h1>
        <p><strong>Submission ID:</strong> {submission.sid}</p>
        <p><strong>Contest Title:</strong> {submission.contest_title}</p>
        <p><strong>Correct:</strong> {correct}</p>
        <p><strong>Wrong:</strong> {wrong}</p>
        <p><strong>Empty:</strong> {empty}</p>
        <p><strong>Total Questions:</strong> {total}</p>
        <p><strong>Band Score:</strong> {band}</p>
        <p><strong>Submitted Time:</strong> {submission.submit_time}</p>

        <h2>Answer Review</h2>
        <ul>
          {result.map((item, index) => (
            <li key={index}>
              <strong>Question {index + 1}:</strong> {item.userAns === '' ? 'Empty' : item.userAns}
              {item.status === 'correct' ? (
                <span style={{ color: 'green' }}> ✔️</span>
              ) : item.status === 'wrong' ? (
                <span style={{ color: 'red' }}> ❌ (Correct Answer: {item.correctAns})</span>
              ) : (
                <span> (Correct Answer: {item.correctAns})</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}
