'use client';

import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';

export interface Task {
    type: string;
    content: string;
    isOpen: boolean;
}

const taskTypes = [
    "Writing Task 1 General",
    "Writing Task 1 Academic",
    "Writing Task 2 General",
    "Writing Task 2 Academic"
];

const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const WritingPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { 
            type: '',
            content: '',
            isOpen: true
        }
    ]);;
    const [problemName, setProblemName] = useState('');
    const [accessUser, setAccessUser] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const toggleTask = (index: number) => {
        setTasks(tasks.map((para, i) => i === index ? { ...para, isOpen: !para.isOpen } : para));
    };

    const addTask = () => {
        setTasks([...tasks, {type: '',content: '',isOpen: true}]);
    };

    const deleteTask = (pIndex: number) => {
        setTasks(tasks.filter((_, i) => i !== pIndex));
    };

    const handleAccessUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Automatically add a space after each comma if not already present
        value = value.replace(/,\s*/g, ', ');

        setAccessUser(value);
    };

    const handleInputChange = (pIndex: number, field: 'type' | 'content', value: string) => {
        const newTasks = [...tasks];
        newTasks[pIndex][field] = value;
        setTasks(newTasks);
    };

    const handleGenerateTask = (pIndex: number, type: string, content: string) => {
        // Retrieve token from localStorage
        setIsLoading(true);
        // console.log(isLoading);

        const token = localStorage.getItem('token');
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateWritingPrompt`, 
            { type, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            // Update the paragraph with the API response data
            const updatedParagraphs = tasks.map((para, index) => 
                index === pIndex ? { ...para, content: response.data.content } : para
            );
            setTasks(updatedParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });

    };
    
    return (
        <>
            <input 
                type="text" 
                placeholder='Name' 
                className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                onChange={(e) => setProblemName(e.target.value)}
                // value={paragraph.title} 
                // onChange={(e) => handleInputChange(pIndex, 'title', e.target.value)}
            />
            <input 
                type="text" 
                placeholder='Access User (comma separated, blank for public access)' 
                className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                value={accessUser}
                onChange={handleAccessUserChange}
            />
            <div className='flex space-x-4'>
                <input 
                    type="datetime-local" 
                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <input 
                    type="datetime-local" 
                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>

            {tasks.map((task, pIndex) => (
                <div key={pIndex} className="border border-gray-300 rounded-md p-4 mb-4">
                    <div onClick={() => toggleTask(pIndex)} className="cursor-pointer flex justify-between items-center">
                        <h4>{`Task ${pIndex + 1}`}</h4>
                        <div>
                            <span>{task.isOpen ? '-' : '+'}</span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(pIndex);
                                }} 
                                className="px-2 rounded-md ml-2"
                            >
                                x
                            </button>
                        </div>
                    </div>
                    {task.isOpen && (
                        <div>
                            <div className='flex'>
                                <select 
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full my-2" 
                                    value={task.type} 
                                    onChange={(e) => handleInputChange(pIndex, 'type', e.target.value)}
                                >
                                    {taskTypes.map((type, i) => (
                                        <option key={i} value={type}>{type}</option>
                                    ))}
                                </select>

                                <button 
                                    onClick={() => handleGenerateTask(pIndex, task.type, task.content)}
                                    // onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                    className="px-2 rounded-md ml-2"
                                    disabled={isLoading}
                                >
                                    Generate
                                </button>
                            </div>
        
                            <textarea 
                                placeholder='Prompt' 
                                className="border border-gray-300 px-4 py-2 rounded-md w-full h-64 my-2" 
                                value={task.content} 
                                onChange={(e) => handleInputChange(pIndex, 'content', e.target.value)}
                                disabled = {isLoading}
                            ></textarea>
                        </div>
                    )}
                </div>
            ))}

            <button 
                onClick={addTask} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
                +
            </button>

            <br />
            

            <button 
                // onClick={createProblem} 
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
                // disabled={isLoading}
            >
                Create Problem
            </button>
        </>
    );
};

export default WritingPage;
