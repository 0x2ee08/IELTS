'use client';

import React, { useState, useRef, useEffect } from 'react';
import config from '../../config';
import { useSearchParams } from 'next/navigation';
import Task1Page from './speaking/task1';
import Task2Page from './speaking/task2';
import Task3Page from './speaking/task3';
import CustomPagination from './speaking/dataDisplayers/customPagination';
import QueuePage from './speaking/dataDisplayers/queue';
import RankingPage from '../ranking/ranking';

export interface Task1QuestionGeneral {
    type: string;
    number_of_task: string;
    length: number;
    questions: string[];
    audioData: string[];
}

interface SpeakingPageProps {
    id: string;
}

interface UserInfo {
    username: string;
    score: number[];
}

const SpeakingPage: React.FC<SpeakingPageProps> = ({ id }) => {
    const params = useSearchParams();
    const [taskArray, setTaskArray] = useState<any[]>([]);
    const [chosenTask, setChosenTask] = useState<number>(1e9);
    const [problemType, setProblemType] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [description, setDescription] = useState<any>();
    const [users, setUsers] = useState<UserInfo[]>([]); // Store users in state
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            getProblem();
            getProblemDescription();
            hasInitialized.current = true;
        }
    }, []);

    useEffect(() => {
        if (currentPage >= taskArray.length) {
            fetchUsersScore(); // Fetch users score when currentPage changes
        }
    }, [currentPage, taskArray]);

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

    const fetchUsersScore = async () => {
        const indexToLetter = (index: number) => String.fromCharCode(65 + index);
        const questions = taskArray.map((_, index) => `Task ${indexToLetter(index)}`);

        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getUsersScore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
        });

        const result = await response.json();
        setUsers(result.users); // Update users in state
        console.log(result.users);
    };

    const renderTaskPage = (type: string, task_id: number, task: Task1QuestionGeneral) => {
        if (!type) return null;
        switch (type) {
            case 'Task 1':
                return (
                    <Task1Page
                        key={currentPage}
                        task={task}
                        task_id={task_id}
                        id={id}
                        description={description}
                        onTaskUpdate={() => handleTaskUpdate()}
                    />
                );
            case 'Task 2':
                return (
                    <Task2Page
                        key={currentPage}
                        task={task}
                        task_id={task_id}
                        id={id}
                        description={description}
                        onTaskUpdate={() => handleTaskUpdate()}
                    />
                );
            case 'Task 3':
                return (
                    <Task3Page
                        key={currentPage}
                        task={task}
                        task_id={task_id}
                        id={id}
                        description={description}
                        onTaskUpdate={() => handleTaskUpdate()}
                    />
                );
            default:
                return null;
        }
    };

    const renderRankingPage = () => {
        const indexToLetter = (index: number) => String.fromCharCode(65 + index);
        const questions = taskArray.map((_, index) => `Task ${indexToLetter(index)}`);

        return (
            <div>
                <RankingPage questions={questions} users={users} />
            </div>
        );
    };

    const renderQueuePage = () => {
        return (
            <div>
                <QueuePage id={id}/>
            </div>
        );
    };

    const handleTaskUpdate = async () => {
        // Your logic to handle task update
    };

    const chooseTask = async (idx: number, type: string) => {
        setChosenTask(idx);
        setProblemType(type);
    };

    return (
        <div>
            {hasInitialized.current && (
                <>
                    <div className='flex justify-center m-4 ml-20 mr-20 mb-10'>
                        <CustomPagination
                            total={taskArray.length}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                    {currentPage < taskArray.length 
                        ? renderTaskPage(taskArray[currentPage]?.type, currentPage, taskArray[currentPage])
                        : (currentPage === taskArray.length
                            ? renderRankingPage() 
                            : renderQueuePage()
                        )
                    }

                </>
            )}
        </div>
    );
};

export default SpeakingPage;
