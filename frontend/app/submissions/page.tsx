'use client';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import config from '../config';
import axios from 'axios';
import Link from 'next/link';

interface Submission {
    type: string;
    sid: string;
    cid: string;
    correct: string,
    wrong: string,
    empty: string, 
    total: string,
    submit_time: string,
    submit_by: string
}

function calculateBand(correct: string, total: string) {
    const correctNum = parseFloat(correct);
    const totalNum = parseFloat(total);
  
    // Avoid division by zero or invalid inputs
    if (isNaN(correctNum) || isNaN(totalNum) || totalNum === 0) {
      return 0;
    }
  
    const ratio = correctNum / totalNum;
  
    // Convert the ratio to base 9
    const base9Ratio = ratio * 9;
  
    // Round the result to the nearest 0.5 or 0
    const roundedBand = Math.round(base9Ratio * 2) / 2;
  
    return roundedBand;
  }

  
const SubmissionPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${config.API_BASE_URL}api/getGlobalSubmission`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
            .then(response => {
                const data = response.data;
                const submissionArray: Submission[] = Object.values(data); // Convert object to array
                setSubmissions(submissionArray);
            })
            .catch(error => {
                console.error('Error fetching submissions:', error);
                setError('Failed to fetch submissions.');
            });
    }, []);

    return (
        <div>
            <Header />
            <div className="submission-list">
                <h2>List of All Global Submissions</h2>
                {error && <p className="error">{error}</p>}
                {!error && submissions.length === 0 && <p>No submissions found.</p>}
                {submissions.length > 0 && (
                    <ul>
                    {submissions.map((submission, index) => (
                      <li key={index}>
                        <Link href={`/results/${submission.sid}`}>
                            <strong>Type: </strong> {submission.type}, 
                            <strong>Submission ID:</strong> {submission.sid}, 
                            <strong>Contest ID:</strong> {submission.cid}, 
                            <strong>User:</strong>{submission.submit_by},
                            <strong>Submit time:</strong> {submission.submit_time}, 
                            <strong>Correct:</strong> {submission.correct}, 
                            <strong>Wrong:</strong> {submission.wrong}, 
                            <strong>Empty:</strong> {submission.empty}, 
                            <strong>Total:</strong> {submission.total},
                            <strong>Band:</strong> {calculateBand(submission.correct, submission.total)}
                        </Link>
                      </li>
                    ))}
                  </ul>                  
                )}
            </div>
            <Footer />
        </div>
    );
};

export default SubmissionPage;
