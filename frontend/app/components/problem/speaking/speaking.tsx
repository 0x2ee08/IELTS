'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';

import Task1Page from './task1';

export interface task1QuestionGeneral {
    type: string,
    number_of_task: string,
    length: number;
    questions: string[],
}

interface SpeakingPageProps {
    
}

const SpeakingPage: React.FC<SpeakingPageProps> = ({  }) => {
    const params = useSearchParams();
    const problem_id = params.get('id');
    const [taskArray, setTaskArray] = useState<any[]>([]);
    const [choosenTask, setChoosenTask] = useState<number>(1e9);

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getProblem();
            hasInitialize.current = true;
        }
    }, []);

    const getProblem = async ( ) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingProblem`, {
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

    const renderTaskPage = (type: number, task: task1QuestionGeneral) => {
        switch (type) {
            case 0:
                return <Task1Page task={task} problem_id={problem_id} onTaskUpdate={(task: any) => handleTaskUpdate()} />;
            case 1:
                return <Task1Page task={task} problem_id={problem_id} onTaskUpdate={(task: any) => handleTaskUpdate()} />;
            default:
                return null;
        }
    };

    const handleTaskUpdate = async () => {

    }

    return (
        <div>
            {taskArray.length > 0 ? (
                taskArray.map((problem, idx) => {
                    return (
                        <div key={idx}>
                            <button
                                onClick={() => setChoosenTask(idx)}
                                className="px-2 py-1 text-black rounded-md"
                            >
                                {problem.type}
                            </button>
                        </div>
                    );
                })
            ) : (
                <p>No problems found.</p>
            )}
            {renderTaskPage(choosenTask, taskArray[choosenTask])}
        </div>
    );
};

export default SpeakingPage;
