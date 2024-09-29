'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomPagination from './writing/dataDisplayers/customPagination';
import RankingPage from '../ranking/ranking';
import config from '../../config';
import Cookies from 'js-cookie';
// import { Link } from 'react-router-dom';
import Link from 'next/link';

interface UserInfo {
    username: string;
    score: number[];
}

const WritingContest = ({ contest }: { contest: any }) => {
    console.log(contest);
    const [currentPage, setCurrentPage] = useState(0);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [userWriting, setUserWriting] = useState<string[]>(Array(contest.tasks.length).fill(""));
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchSubmission = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getWritingUserSubmissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: contest.id }),
        });

        const result = await response.json();
        setSubmissions(result); // Update users in state
        // console.log(result);
    };

    useEffect(() => {
        const cookieData = Cookies.get('userWriting-'+contest.id);
        const cPage = Cookies.get('Writing_Current_Page-'+contest.id);
        if (cookieData) {
            const parsedData = JSON.parse(cookieData);
            setUserWriting(parsedData);
        }
        if(cPage){
            setCurrentPage(Number(cPage));
        }
        fetchSubmission();
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
        setIsLoading(true);

        try {
            // Call your API to submit the task
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}api/submitWritingContest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: contest.id, taskId,  prompt: contest.tasks[taskId].content, content: userWriting[taskId] }),
            });
            const result = await response.json();

            // Remove text from the current variable
            const newUserWriting = [...userWriting];
            newUserWriting[taskId] = ""; // Clear the text for the specific task
            setUserWriting(newUserWriting);
            Cookies.set('userWriting-'+contest.id, JSON.stringify(newUserWriting), { expires: 7 }); // Update cookie

            window.location.reload();
        } catch (error) {
            console.error('Error submitting task:', error);
            // Optionally, handle error (e.g., show a notification)
        } finally{
            setIsLoading(false);
        }
    };

    const renderTaskPage = (type: string, task_id: number, task: any) => {
        if (!type) return null;
        if(type === 'Writing Task 2' || type === 'Writing Task 1 General'){
            return (
                <div>  
                    <p className="font-black text-xl"> Question: </p>
                    <p className='mt-4'> {task.content} </p>
                    <p className="font-black text-xl mt-4"> Essay Drafting Section</p>
                    <textarea
                        id={`essay-${task_id}`} // Unique ID for each textarea
                        value={userWriting[task_id]} // Set value based on userWriting state
                        onChange={(e) => handleTextareaChange(task_id, e.target.value)} // Update state on change
                        className="w-full h-80 p-4 border border-black rounded-lg mt-2 resize-none overflow-y-auto focus:border-black focus:outline-black"

                        disabled = {isLoading}

                        placeholder="Write your essay here..."
                        rows={6} // Initial height for essay
                    />
                    <div className="flex justify-center mt-2">
                    <button
                        className={`font-bold py-2 px-4 rounded-lg ${
                            isLoading
                                ? 'bg-gray-400 cursor-not-allowed' // Styling when the button is disabled
                                : 'bg-[#0077B6] hover:bg-[#3d5a80] text-white' // Normal styling
                        }`}
                        onClick={() => {handleSubmit(task_id)}}

                        disabled = {isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Submit Task'} {/* Show 'Loading...' when loading */}
                    </button>
                    </div>
                </div>
            );
        }
        else{
            return null;
        }
    };


    const renderUserSubmission = () => {
        return (
            <div style={{ marginTop: '20px' }}> {/* Adds space above the table */}
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fff' }}> {/* Set top row to white */}
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Submission ID</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Task ID</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Band</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions &&
                            submissions
                                .filter((submission) => submission.task_id === currentPage) // Filter by matching taskID
                                .map((submission, index) => {
                                    // Determine band color based on the band score
                                    let bandColor = "text-red-600"; // Default color for band < 5.0
                                    const bandScore = submission.band;
    
                                    if (bandScore >= 7.0) {
                                        bandColor = "text-green-600";
                                    } else if (bandScore >= 5.0) {
                                        bandColor = "text-yellow-600";
                                    }
    
                                    return (
                                        <tr
                                            key={submission.sid}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? '#fff' : '#f2f2f2', // Alternating row colors
                                            }}
                                        >
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                <Link href={`/results/${submission.sid}`}>
                                                    {submission.sid}
                                                </Link>
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                {submission.task_id}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                <span className={bandColor}>{bandScore}</span> {/* Apply the band color class */}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                {new Date(submission.time_created).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                    </tbody>
                </table>
            </div>
        );
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
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
        const endTime = new Date(contest.endTime).getTime();
        const now = Date.now();
        const difference = endTime - now;
        setTimeLeft(difference > 0 ? difference : 0);
        };

        // Calculate the time left initially
        calculateTimeLeft();

        const interval = setInterval(() => {
        calculateTimeLeft();
        }, 1000);

        return () => clearInterval(interval); // Cleanup the interval on unmount
    }, [contest.endTime]);

    // Helper function to format time left
    const formatTimeLeft = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts: string[] = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, '0')}h`); // Show hours only if days > 0
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${String(minutes).padStart(2, '0')}m`); // Show minutes if days or hours > 0
        parts.push(`${String(seconds).padStart(2, '0')}s`); // Always show seconds

        return parts.join(' ');
    };


    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex justify-between">
                <div className="w-4/5 bg-white ml-16 mt-2 p-8">
                    <div className='flex justify-center m-4 ml-20 mb-10'>
                        <CustomPagination
                            total={contest.tasks.length}
                            currentPage={currentPage}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                Cookies.set('Writing_Current_Page-' + contest.id, page.toString());
                            }}
                        />
                    </div>
                    {currentPage < contest.tasks.length
                        ? renderTaskPage(contest.tasks[currentPage]?.type, currentPage, contest.tasks[currentPage])
                        : renderRankingPage()
                    }
                </div>
                <div className="w-1/5 bg-white mr-20 mt-16 flex flex-col">
                    <div className='border border-black rounded p-4 mb-2'>
                        <p className="text-2xl font-bold text-center">{contest.problemName}</p>
                    </div>
                    <div className='border border-black rounded p-4 mb-4'>
                        <p className='text-center text-xl'>{timeLeft > 0 ? `Time: ${formatTimeLeft(timeLeft)}` : "Finished"}</p>
                    </div>
                    {/* Render User Submissions below the timer */}
                    {currentPage < contest.tasks.length && renderUserSubmission()} {/* Move this under the timer box */}
                </div>
            </div>
        </div>
    );
};

export default WritingContest;