// AddProblem.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ReadingRender from './ReadingRender';
// import SpeakingRender from './SpeakingRender';
import WritingRender from './WritingRender';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import axios from 'axios';
import config from '../../config';
import { useParams } from 'next/navigation';


const SubmissionDetail: React.FC = () => {
    const [problemType, setProblemType] = useState<string | null>(null);
    const { submissionID } = useParams();
    
    useEffect(() => {
        const fetchContestType = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.post(`${config.API_BASE_URL}api/get_contest_type`, { submissionID }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProblemType(response.data.type);
            } catch (error) {
                console.error('Error fetching contest type:', error);
            }
        };
    
        fetchContestType();
    });

    const renderProblemOptions = () => {
        switch (problemType) {
            case 'Reading':
                return <ReadingRender />;
            case 'Speaking':
                // return <SpeakingRender />;
            case 'Writing':
                return <WritingRender />;
            default:
                return "Fetching contest...";
        }
    };

    return (
        <div>
            <Header />
            {renderProblemOptions()}
            <Footer />
        </div>
    );
};

export default SubmissionDetail;
