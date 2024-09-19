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
    submit_time: string
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

  
const ResultPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [titles, setTitles] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${config.API_BASE_URL}api/getAllSubmission`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                const data = response.data;
                const submissionArray: Submission[] = Object.values(data); // Convert object to array
                setSubmissions(submissionArray);

                // Fetch contest titles for each submission
                await Promise.all(
                    submissionArray.map(async (submission) => {
                        try {
                            const titleResponse = await axios.post(
                                `${config.API_BASE_URL}api/getContestTitle`,
                                { contestID: submission.cid },
                                { headers: { 'Authorization': `Bearer ${token}` } }
                            );
                            setTitles(prevTitles => ({
                                ...prevTitles,
                                [submission.cid]: titleResponse.data.title
                            }));
                        } catch (error) {
                            console.error(`Error fetching title for contest ${submission.cid}:`, error);
                        }
                    })
                );
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setError('Failed to fetch submissions.');
            }
        };

        fetchSubmissions();
    }, []);

    return (
        <div>
            <Header />
            <div className="submission-list">
                <h2>List of All Submissions</h2>
                {error && <p className="error">{error}</p>}
                {!error && submissions.length === 0 && <p>No submissions found.</p>}
                {submissions.length > 0 && (
                    <ul>
                        {submissions.map((submission, index) => (
                            <li key={index}>
                                <Link href={`/results/${submission.sid}`}>
                                    <strong>Type: </strong> {submission.type}, 
                                    <strong>Contest title:</strong> {titles[submission.cid] || 'Loading...'}, 
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

export default ResultPage;
