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

    if (isNaN(correctNum) || isNaN(totalNum) || totalNum === 0) {
      return 0;
    }

    const ratio = correctNum / totalNum;
    const base9Ratio = ratio * 9;
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
                const submissionArray: Submission[] = Object.values(data);
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
            <div className="submission-list" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 
                    style={{
                        color: '#333',
                        textAlign: 'center',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        padding: '10px 0',
                        borderBottom: '2px solid #ddd',
                    }}
                >
                    Global Submissions
                </h2>
                {error && <p className="error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {!error && submissions.length === 0 && <p style={{ textAlign: 'center' }}>No submissions found.</p>}
                
                {submissions.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f1f1' }}>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Submission ID</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Contest ID</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>User</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Submit Time</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Correct</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Wrong</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Empty</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Total</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Band</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>{submission.type}</td>
                                    <td style={{ padding: '10px' }}>
                                        <Link href={`/results/${submission.sid}`} style={{ color: '#0070f3', textDecoration: 'underline' }}>
                                            {submission.sid}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '10px' }}>{submission.cid}</td>
                                    <td style={{ padding: '10px' }}>{submission.submit_by}</td>
                                    <td style={{ padding: '10px' }}>{submission.submit_time}</td>
                                    <td style={{ padding: '10px', color: "green" }}>{submission.correct}</td>
                                    <td style={{ padding: '10px', color: "red" }}>{submission.wrong}</td>
                                    <td style={{ padding: '10px', color: "gray"}}>{submission.empty}</td>
                                    <td style={{ padding: '10px' }}>{submission.total}</td>
                                    <td style={{ padding: '10px' }}>{calculateBand(submission.correct, submission.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>                
                )}
            </div>
            <Footer />
        </div>
    );
};

export default SubmissionPage;
