'use client';

import React, { useState, useEffect, useRef } from 'react';
import config from '../../../../config';
import Link from 'next/link'; // Import Link from next/link

interface QueuePageProps {
    id: string; 
}

const QueuePage: React.FC<QueuePageProps> = ({ id }) => {
    const hasInitialized = useRef(false);
    const [submissions, setSubmissions] = useState<any[]>([]);

    useEffect(() => {
        if (!hasInitialized.current) {
            getSpeakingInQueueAnswer();
            hasInitialized.current = true;
        }
    }, []);

    const getSpeakingInQueueAnswer = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingInQueueAnswer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
        });

        const result = await response.json();
        setSubmissions(result.submissions);
    };

    return (
        <div className="p-8">
            {/* <h1 className='mb-4 text-xl'>
                Waiting too long for checking Speaking records? 
                <Link href="/premiumPlan" className="text-blue-500 hover:underline">
                    {' '}Check our premium plan!
                </Link>
            </h1> */}
            <h1 className='text-xl'><strong>Your in queue submissions</strong></h1>
            <ul className="mt-4">
                {submissions.map((submission, index) => (
                    <li key={index} className="mb-2">
                        {/* Customize this part based on the structure of your submission object */}
                        <strong>Submission {index + 1}:</strong> {submission.id} {/* or submission.someProperty */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QueuePage;
