'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';
import Task1Page from './task1';
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';

interface SpeakingPageProps {
    
}

const SpeakingPage: React.FC<SpeakingPageProps> = ({  }) => {
    const params = useSearchParams();
    const problem_id = params.get('id');
    const [taskArray, setTaskArray] = useState<any[]>([]);
    const [choosenTask, setChoosenTask] = useState('');

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getProblem();
            hasInitialize.current = true;
        }
    }, []);

    const getProblem = async ( ) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getProblem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problem_id }),
        });
        const result = await response.json();

        setTaskArray(result.task);
    };

    const renderContent = () => {
        switch (choosenTask) {
            case 'Speaking':
                return <SpeakingPage />;
            case 'AnotherType':
                return null;
            default:
                return null;
        }
    };

    const renderTaskPage = (type: string, idx: number) => {
        switch (type) {
            case 'Task 1':
                return <Task1Page onTaskUpdate={(task: any) => handleTaskUpdate(task, idx)} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {taskArray.length > 0 ? (
                taskArray.map((problem, idx) => {
                    const link = `/loader/problem?id=${problem_id}`;
                    return (
                        <div key={idx}>
                            <div className="my-1"></div> 
                            <a href={link}>
                                <p className="font-bold">{problem.type}</p>
                            </a>
                        </div>
                    );
                })
                ) : (
                    <p>No problems found.</p>
                )}
        </div>
    );
};

export default SpeakingPage;
