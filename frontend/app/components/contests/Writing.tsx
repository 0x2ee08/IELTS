'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomPagination from './writing/dataDisplayers/customPagination';
import RankingPage from '../ranking/ranking';
import config from '../../config';
import Cookies from 'js-cookie';

interface UserInfo {
    username: string;
    score: number[];
}

const WritingContest = ({ contest }: { contest: any }) => {
    console.log(contest);
    const [currentPage, setCurrentPage] = useState(0);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [userWriting, setUserWriting] = useState<string[]>(Array(contest.tasks.length).fill(""));

    const fetchUsersScore = async () => {
        const indexToLetter = (index: number) => String.fromCharCode(65 + index);
        const questions = contest.tasks.map((_: any, index: any) => `Task ${indexToLetter(index)}`);

        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getWritingUsersScore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: contest.id }),
        });

        const result = await response.json();
        setUsers(result.users); // Update users in state
        console.log(result.users);
    };

    useEffect(() => {
        const cookieData = Cookies.get('userWriting-'+contest.id);
        if (cookieData) {
            const parsedData = JSON.parse(cookieData);
            setUserWriting(parsedData);
        }
    }, []);

    useEffect(() => {
        if (currentPage >= contest.tasks.length) {
            fetchUsersScore(); // Fetch users score when currentPage changes
        }
    }, [currentPage, contest.tasks]);

    const handleTextareaChange = (taskId: number, value: string) => {
        const newUserWriting = [...userWriting];
        newUserWriting[taskId] = value;
        setUserWriting(newUserWriting);
        Cookies.set('userWriting-'+contest.id, JSON.stringify(newUserWriting), { expires: 7 }); // Expires in 7 days
    };


    const handleSubmit = async (taskId: number) => {
        try {
            // Call your API to submit the task
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}api/submitWritingContest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: contest.id, content: userWriting[taskId] }),
            });

            // Remove text from the current variable
            const newUserWriting = [...userWriting];
            newUserWriting[taskId] = ""; // Clear the text for the specific task
            setUserWriting(newUserWriting);
            Cookies.set('userWriting', JSON.stringify(newUserWriting), { expires: 7 }); // Update cookie

            window.location.reload();
        } catch (error) {
            console.error('Error submitting task:', error);
            // Optionally, handle error (e.g., show a notification)
        }
    };

    const renderTaskPage = (type: string, task_id: number, task: any) => {
        if (!type) return null;
        if(type === 'Writing Task 2' || type === 'Writing Task 1 General'){
            return (
                <>
                    {task.content}

                    <textarea
                        id={`essay-${task_id}`} // Unique ID for each textarea
                        value={userWriting[task_id]} // Set value based on userWriting state
                        onChange={(e) => handleTextareaChange(task_id, e.target.value)} // Update state on change
                        className="w-full p-3 border rounded-lg"
                        placeholder="Write your essay here..."
                        style={{ overflow: 'hidden' }} // Disable manual resizing
                        rows={6} // Initial height for essay
                    />

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {handleSubmit(task_id)}}
                    >
                        Submit Task
                    </button>
                </>
            );
        }
        else{
            return null;
        }
    };

    const renderUserSubmission = () => {
        return null;
    };

    const renderRankingPage = () => {
        const indexToLetter = (index: number) => String.fromCharCode(65 + index);
        const questions = contest.tasks.map((_: any, index: any) => `Task ${indexToLetter(index)}`);

        return (
            <div>
                <RankingPage questions={questions} users={users} />
            </div>
        );
    };


    return (
        <div>
            <h1>{contest.problemName}</h1>
            <p>Start Time: {contest.startTime}</p>
            <p>End Time: {contest.endTime}</p>
            
            <div className='flex justify-center m-4 ml-20 mr-20 mb-10'>
                <CustomPagination
                    total={contest.tasks.length}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
            {currentPage < contest.tasks.length 
                ? renderTaskPage(contest.tasks[currentPage]?.type, currentPage, contest.tasks[currentPage])
                : (renderRankingPage())
            }
            <br />
            {currentPage < contest.tasks.length && renderUserSubmission()}
        </div>
    );
};

export default WritingContest;