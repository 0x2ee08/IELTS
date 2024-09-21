import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';

export interface task2QuestionGeneral {
    type: string,
    number_of_task: string,
    length: number;
    questions: string[],
}

interface Task2PageProps {
    onTaskUpdate: (task: task2QuestionGeneral) => void;
}

const Task2Page: React.FC<Task2PageProps> = ({ onTaskUpdate }) => {
    const [task, setTask] = useState<task2QuestionGeneral>({
        type: "Task 2",
        number_of_task: '',
        length: 300,
        questions: [],
    });

    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            hasInitialize.current = true;
        }
    }, []);

    useEffect(() => {
        onTaskUpdate(task);
    }, [task]);

    const handleTaskNumberChange = (number_of_task: string) => {
        const inputValue = number_of_task;

        if(inputValue === "") {
            setTask((prevTask) => ({
                ...prevTask,
                type: "Task 2",
                number_of_task: '',
                length: 300,
                questions: [],
            }));
            return;
        }

        const parsedNumber = parseInt(inputValue, 10);
        if (!isNaN(parsedNumber) && parsedNumber >= 1 && parsedNumber <= 1) {
            setTask((prevTask) => ({
                ...prevTask,
                number_of_task: parsedNumber.toString(),
                questions: Array(parsedNumber).fill(''),
            }));
        } else {
            alert('Please enter a valid number: 1.');
            setTask((prevTask) => ({
                ...prevTask,
                number_of_task: '',
                length: 300,
                questions: [],
            }));
        }
    };

    const handleQuestionChange = (index: number, value: string) => {
        setTask((prevTask) => {
            const updatedQuestions = [...prevTask.questions];
            updatedQuestions[index] = value;
            return {
                ...prevTask,
                questions: updatedQuestions,
            };
        });
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setMinutes(isNaN(value) ? 0 : value);
        updateLength(value, seconds);
    };

    const handleSecondsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setSeconds(isNaN(value) ? 0 : value);
        updateLength(minutes, value);
    };

    const updateLength = (minutes: number, seconds: number) => {
        const totalSeconds = minutes * 60 + seconds;
        setTask((prevTask) => ({
            ...prevTask,
            length: totalSeconds,
        }));
    };

    const generateSpeakingTask2_onlyOne = async (index: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/generateSpeakingTask2_onlyOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        });
        const result = await response.json();
        setTask(prevTask => {
            const updatedQuestions = [...prevTask.questions];
            updatedQuestions[index] = result.content;

            return {
                ...prevTask,
                questions: updatedQuestions,
            };
        });
    };

    return (
        <div>
            <div className="flex flex-col">
                <div className='flex items-center'>
                    <input
                        type="text"
                        placeholder='Number of questions'
                        className="border border-gray-300 px-4 py-2 rounded-md w-full h-10 my-2"
                        value={task.number_of_task}
                        onChange={(e) => handleTaskNumberChange(e.target.value)}
                    />
                    <select
                        className="border border-gray-300 px-4 py-2 rounded-md w-40 h-10 mx-2"
                        value={minutes}
                        onChange={handleMinutesChange}
                    >
                        {[...Array(6).keys()].map(i => (
                            <option key={i} value={i}>{i} min</option>
                        ))}
                    </select>
                    <select
                        className="border border-gray-300 px-4 py-2 rounded-md w-40 h-10"
                        value={seconds}
                        onChange={handleSecondsChange}
                    >
                        {[...Array(61).keys()].map(i => (
                            <option key={i} value={i}>{i} sec</option>
                        ))}
                    </select>
                </div>
                <div className='font-semibold'>
                    Enter question contents or click the generate button of the right side
                </div>
                {task.questions.map((question, index) => (
                    <div className='flex items-center'>
                        <span className="whitespace-nowrap mr-4">
                            {`Question #${index + 1}:`}
                        </span>
                        <input
                            key={index}
                            type="text"
                            placeholder={``}
                            className="border border-gray-300 px-4 py-2 rounded-md w-full h-10 my-2"
                            value={question}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                        />
                        <button
                            onClick={() => generateSpeakingTask2_onlyOne(index)}
                            className="px-4 rounded-md ml-2 whitespace-nowrap"
                        >
                            Generate this question
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Task2Page;
