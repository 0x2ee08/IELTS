'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config'; 
import './submission.css';
import Link from 'next/link';

interface Submission {
    type: string,
    sid: string,
    cid: string,
    task_id: number,
    contest_title: string,
    questions: string[],
    result: Record<string,any>[],
    submit_time: string,
    submit_by: string;
  }

export default function SpeakingRender() {
  const { submissionID } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  
  useEffect(() => {
        const fetchContestType = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.post(`${config.API_BASE_URL}api/get_speaking_submission_global`, { submissionID }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSubmission(response.data);
                console.log(response.data);
                console.log(submission);
            } catch (error) {
                console.error('Error fetching contest type:', error);
            }
        };

        fetchContestType();
    }, [submissionID]); // Add an empty dependency array to run only once

    console.log(submission);
  return (
    <div className='flex flex-col min-h-screen p-4 ml-16 mr-16'>
        <div style={{
        backgroundColor: '#fff8c4',  // Light blue background
        color: '#333',
        padding: '8px 20px',
        fontSize: '14px',
        textAlign: 'center',
        width: '100%'
        }}>
                This site is under development. This is the raw data.
        </div>
        <br />
        {submission ? (
            <>
                <div className='flex flex-col justify-between bg-white border border-gray-300 rounded-lg shadow-md p-8'>
                    <Link 
                    href={`/contests/${submission.cid}`}
                    className='font-black text-4xl'
                    >
                        {submission.contest_title}
                    </Link> 
                    <div>
                    <span>By: </span>
                    <Link href={`/loader/profile?id=${submission.submit_by}`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">{submission.submit_by}</span>
                    </Link>
                    <span> ,{new Date(submission.submit_time).toLocaleString()}</span>
                    </div>
                </div>
                <ul>
                    {submission.questions.map((question, index) => {
                        const res = submission.result[index];
                        return (
                            <div
                            key={index}
                            className='flex flex-col justify-between bg-white border border-gray-300 rounded-lg shadow-md p-8 mt-4'
                            >
                                <h3>Question {index + 1}:</h3>
                                <p>{question}</p>
                                {res && res.feedback && ( 
                                    <>
                                    <h3>Your response: {res.data.matched_transcripts}</h3>
                                    <div>
                                        <p><strong>Fluency:</strong> {res.feedback.fluency}</p>
                                        <p><strong>Grammar:</strong> {res.feedback.grammar}</p>
                                        <p><strong>Lexical:</strong> {res.feedback.lexical}</p>
                                        <p><strong>Response:</strong> {res.feedback.response}</p>
                                        <p><strong>Total:</strong> {res.feedback.total}</p>
                                    </div>
                                    </>
                                )}
                        </div>
                        );
                    })}
                </ul>
            </>

            
        ) : (
            <p>Loading submission data...</p>
        )}
    </div>
  );
}