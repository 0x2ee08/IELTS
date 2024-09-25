'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import Task1Page from './speaking/task1';
import Task2Page from './speaking/task2';
import Task3Page from './speaking/task3';

// Utility function to generate a random string
const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const SpeakingPage: React.FC = () => {
    const [generatedTask, setGeneratedTask] = useState('');
    const [taskArray, setTaskArray] = useState<any[]>([]);
    const [idList, setIdList] = useState<{ id: string, speaking_id: string }[]>([]);
    const [selectedTask, setSelectedTask] = useState<string>('Task 1');
    const [problemName, setProblemName] = useState('');
    const [accessUser, setAccessUser] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';
    const [isLoading, setIsLoading] = useState(false);

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            generateSpeakingTask1(5);
            hasInitialize.current = true;
        }
    }, []);

    const generateSpeakingTask1 = async (number_of_task: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/generateSpeakingTask1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ number_of_task }),
        });
        const result = await response.json();
        setGeneratedTask(result.content);
    };

    const handleTaskUpdate = (task: any, idx: number) => {
        setTaskArray(prevArray => {
            const updatedArray = [...prevArray];
            updatedArray[idx] = task;
            return updatedArray;
        });
    };

    const handleAddTask = () => {
        if (selectedTask) {
            const speaking_id = generateRandomString(8);
            setIdList(prevIdList => {
                const newIdList = [...prevIdList, { id: selectedTask, speaking_id }];
                return newIdList;
            });
            setTaskArray(prevArray => {
                const updatedArray = [...prevArray];
                updatedArray.push({});
                return updatedArray;
            });
        }
    };

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTask(e.target.value);
    };

    const handleDeleteTask = (idx: number) => {
        setIdList(prevIdList => {
            const newIdList = prevIdList.filter((_, index) => index !== idx);
            return newIdList;
        });
        setTaskArray(prevArray => {
            const updatedArray = prevArray.filter((_, index) => index !== idx);
            return updatedArray;
        });
    };


    const renderTaskPage = (id: string, idx: number) => {
        switch (id) {
            case 'Task 1':
                return <Task1Page onTaskUpdate={(task: any) => handleTaskUpdate(task, idx)} />;
            case 'Task 2':
                return <Task2Page onTaskUpdate={(task: any) => handleTaskUpdate(task, idx)} />;
            case 'Task 3':
                return <Task3Page onTaskUpdate={(task: any) => handleTaskUpdate(task, idx)} />;
            default:
                return null;
        }
    };

    const create_speaking_problem = async () => {
        for(let i=0; i<taskArray.length; i++) {
            console.log(taskArray[i]);
            if(taskArray[i].type !== "Task 2") {
                for(let j=0; j<taskArray[i].number_of_task; j++) {
                    await fetch(`${config.API_PRONOUNCE_BASE_URL}api_pronounce/getAudioFromText`, {
                        method: "post",
                        body: JSON.stringify({ "text": taskArray[i].questions[j] }),
                        headers: { "X-Api-Key": STScoreAPIKey }
                    }).then(res => res.json())
                        .then(data => {
                            taskArray[i].audioData[j] = data['audioBase64'];
                        });
                    await fetch(`${config.API_PRONOUNCE_BASE_URL}api_pronounce/saveToGGDrive`, {
                        method: "post",
                        body: JSON.stringify({ "audioBase64": taskArray[i].audioData[j] }),
                        headers: { "X-Api-Key": STScoreAPIKey }
                    }).then(res => res.json())
                        .then(data => {
                            console.log(data['audioData']);
                            taskArray[i].audioData[j] = data['audioData'];
                        });
                }
            }
        }
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/create_speaking_problem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problemName, accessUser, startTime, endTime, taskArray }),
        });
        const result = await response.json();
        if(result.success) {
            alert('Create problem successfully')
            setIdList([]);
            setTaskArray([]);
        }
        else {
            alert('Failed to create problem')
        }
    }

    const handleAccessUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Automatically add a space after each comma if not already present
        value = value.replace(/,\s*/g, ', ');

        setAccessUser(value);
    };

    const removeDuplicates = (value: string) => {
        // Split the string by comma and trim any extra spaces
        const usersArray = value.split(',').map(user => user.trim());
      
        // Create a Set to remove duplicates
        const uniqueUsers = [...new Set(usersArray)];
      
        // Join the unique values back into a string
        return uniqueUsers.join(', ');
    };

    const addStudent =() =>{
        let value = accessUser;
        if(value !== '') value = value + ',' + studentClass;
        else value = studentClass;
        // console.log(value);
        value = value.replace(/,\s*/g, ', ');
        value = removeDuplicates(value);
        setAccessUser(value);
    };

    const [schoollist, setSchoollist] = useState<any[]>([]);
    const [classlist, setClasslist] = useState<any[]>([]);
    const [school, setSchool] = useState('');
    const [class_, setClass_] = useState('');
    const [studentClass, setStudentClass] = useState('');

    const getSchoolList = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_school_list`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSchoollist(response.data.result);
        } catch (error) {
            console.error('Error fetching school list:', error);
        }
    };

    const getClassList = async (selectedSchool: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_class_list`, { school: selectedSchool }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setClasslist(response.data.classlist || []);
        } catch (error) {
            console.error('Error fetching class list:', error);
        }
    };

    const getStudentList = async (selectedSchool: string, selectedClass: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/getAllStudent`, { school: selectedSchool, _class: selectedClass }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setStudentClass(response.data.students);
        } catch (error) {
            console.error('Error fetching class list:', error);
        }
    };

    const handleSchoolChange = (newschool: string) => {
        setSchool(newschool);
        setClass_(''); // Reset class selection when school changes
        setStudentClass('');
        getClassList(newschool); // Fetch classes for the selected school
    };

    const handleClassChange = (selectSchool: string, newclass: string) => {
        setClass_(newclass); // Reset class selection when school changes
        setStudentClass('');
        getStudentList(selectSchool, newclass);
    };

    useEffect(() => {
        getSchoolList();
    }, []);

    return (
        <div>
            <input
                key={"name"}
                type="text"
                placeholder={`Name`}
                className="border border-gray-300 px-4 py-2 rounded-md w-full h-10 my-2"
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
            />
            <div  className="border border-gray-300 rounded-md p-4 mb-4">
                Access user
                <input 
                    type="text" 
                    placeholder='Access User (comma separated, blank for public access)' 
                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                    value={accessUser}
                    onChange={handleAccessUserChange}
                />

                Or choose classes:

                <div className='flex space-x-4'>
                    <select
                        value={school}
                        onChange={(e) => handleSchoolChange(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    >
                        <option value="">Select a school</option>
                        {schoollist.map((schoolOption) => (
                            <option key={schoolOption.id} value={schoolOption.id}>
                                {schoolOption.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={class_}
                        onChange={(e) => handleClassChange(school, e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    >
                        <option value="">Select a class</option>
                        {classlist.map((schoolOption) => (
                            <option key={schoolOption} value={schoolOption.id}>
                                {schoolOption}
                            </option>
                        ))}
                    </select>
                </div>
                <br />
                <textarea
                    value={studentClass}
                    className="border border-gray-300 px-3 py-2 rounded-md w-full h-32"
                    disabled={true}
                />

                <button 
                    onClick={addStudent} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                    disabled={isLoading}
                >
                    Add Student
                </button>
            </div>

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
            <div className='mt-4'>
                {idList.map((item, idx) => (
                    <div key={item.speaking_id} className="border border-gray-300 rounded-md p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{`Speaking #${idx + 1} (${item.id})`}</h3>
                            <button
                                onClick={() => handleDeleteTask(idx)}
                                className="px-2 py-1 bg-red-500 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                        {renderTaskPage(item.id, idx)}
                    </div>
                ))}
            </div>
            <div className="flex items-center mb-4 mt-4">
                <select
                    className="border border-gray-300 px-4 py-2 rounded-md"
                    value={selectedTask}
                    onChange={handleDropdownChange}
                >
                    <option value="Task 1">Task 1</option>
                    <option value="Task 2">Task 2</option>
                    <option value="Task 3">Task 3</option>
                    {/* Add more options if needed */}
                </select>
                <button
                    onClick={handleAddTask}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                    Add
                </button>
            </div>
            <button
                onClick={create_speaking_problem}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
                Create Problem
            </button>
        </div>
    );
};

export default SpeakingPage;
