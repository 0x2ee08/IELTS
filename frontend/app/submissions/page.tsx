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
    // correct: string,
    // wrong: string,
    // empty: string, 
    // total: string,
    result: Record<string, any>;
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

  
const ResultPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [titles, setTitles] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${config.API_BASE_URL}api/getGlobalSubmission`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = response.data;
                let submissionArray: Submission[] = Object.values(data); // Convert object to array
                
                // Sort the submissions by submit_time (descending order)
                submissionArray = submissionArray.sort((a, b) => {
                    const dateA = new Date(a.submit_time).getTime();
                    const dateB = new Date(b.submit_time).getTime();
                    return dateB - dateA; // Descending order
                });
    
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
            <div className="submission-list p-6">
                <h2 className="text-xl font-semibold mb-6">List of Global Submissions</h2>
                {error && <p className="error text-red-500">{error}</p>}
                {!error && submissions.length === 0 && <p>No submissions found.</p>}
                {submissions.length > 0 && (
                    <ul className="space-y-6">
                        {submissions.map((submission, index) => {
                            const bandScore = calculateBand(submission.result.correct, submission.result.total);
                            let bandColor = "text-red-600"; // Default color for band < 5.0
                            if (bandScore >= 7.0) {
                                bandColor = "text-green-600";
                            } else if (bandScore >= 5.0) {
                                bandColor = "text-yellow-600";
                            }
    
                            return (
                                <li key={index} className="border p-6 rounded-lg shadow-md">
                                    <Link href={`/results/${submission.sid}`}>
                                        <div className="flex items-center">
                                            {/* Band Score */}
                                            <span className={`text-4xl font-bold ${bandColor} mr-6`}>
                                                {bandScore.toFixed(1)}
                                            </span>
    
                                            {/* Contest Info */}
                                            <div className="text-lg space-y-1">
                                                <p className="font-semibold">
                                                    {titles[submission.cid] || 'Loading...'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Contest type: {submission.type}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Submit by: {submission.submit_by || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Submit time: {new Date(submission.submit_time).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
    
                                        {/* Answer Stats */}
                                        <div className="mt-4 text-base">
                                            <span className="text-green-500 mr-4">Correct: {submission.result.correct}</span>
                                            <span className="text-red-500 mr-4">Wrong: {submission.result.wrong}</span>
                                            <span className="text-gray-500">Empty: {submission.result.empty}</span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ResultPage;