'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import Task1Page from './speaking/task1';
import CustomPagination from './speaking/dataDisplayers/customPagination';

export interface task1QuestionGeneral {
    type: string,
    number_of_task: string,
    length: number;
    questions: string[],
}

interface SpeakingPageProps {
    id: string;
}

const SpeakingPage: React.FC<SpeakingPageProps> = ({id}) => {
    const params = useSearchParams();
    const [taskArray, setTaskArray] = useState<any[]>([]);
    const [choosenTask, setChoosenTask] = useState<number>(1e9);
    const [problem_type, setProblem_type] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [description, setDescription] = useState<any>();

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getProblem();
            getProblemDescription();
            hasInitialize.current = true;
        }
    }, []);

    const getProblem = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingProblem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
        });
        const result = await response.json();

        setTaskArray(result.task);
        console.log(result.task);
    };

    const getProblemDescription = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getProblemDescription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
        });
        const result = await response.json();

        setDescription(result.data);
    };

    const renderTaskPage = (type: string, task_id: number, task: task1QuestionGeneral) => {
        if (!type) return null;
        switch (type) {
            case "Task 1":
                return (
                    <Task1Page
                        key={currentPage}
                        task={task}
                        task_id={task_id}
                        id={id}
                        description={description}
                        onTaskUpdate={(task: any) => handleTaskUpdate()}
                    />
                );
            default:
                return null;
        }
    };

    const handleTaskUpdate = async () => {
        // Your logic to handle task update
    };

    const chooseTask = async (idx: number, type: string) => {
        setChoosenTask(idx);
        setProblem_type(type);
    };

    return (
        <div>
            {hasInitialize.current && (
                <>
                    <div className='flex justify-center m-4 ml-20 mr-20 mb-10'>
                        <CustomPagination
                            total={taskArray.length}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                    {renderTaskPage(taskArray[currentPage]?.type, currentPage, taskArray[currentPage])}
                </>
            )}
        </div>
    );
};

export default SpeakingPage;
