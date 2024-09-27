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
    <>
        Speaking page : {submissionID}
        <br />
        {submission ? (
            <>
                Only owners can access to the audio file by going to contest page by click this <Link href={`/contests/${submission.cid}`}>Link</Link> 
            </>
        ) : (
            <p>Loading submission data...</p>
        )}
        {/* cid: {submission.cid}; */}
        
    </>
  );
}
