'use client';

import React, { useEffect, useState, useRef, useReducer } from 'react';
import axios from 'axios';
import Link from 'next/link';
import config from '../../config';
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';

import SpeakingPage from './speaking/speaking';

const ProblemDetail: React.FC = () => {
    const params = useSearchParams();
    const problem_id = params.get('id');
    const router = useRouter();
    const [typeOfProblem, setTypeOfProblem ] = useState('');

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            get_problem_type();
            hasInitialize.current = true;
        }
    }, []);

    const get_problem_type = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/get_problem_type`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ problem_id }),
            });
            const result = await response.json();

            setTypeOfProblem(result.type);
        } catch (error) {
            console.error('Error getting list:', error);
            alert('Internal server error');
        }
    }

    const renderContent = () => {
        switch (typeOfProblem) {
            case 'Speaking':
                return <SpeakingPage />;
            case 'AnotherType':
                return null;
            default:
                return <div className="p-4">Problem type is not supported or not found.</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {renderContent()}
        </div>
    );
};

export default ProblemDetail;
