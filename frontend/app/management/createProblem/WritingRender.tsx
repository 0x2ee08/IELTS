'use client';

import React, { useState , useEffect} from 'react';
import axios from 'axios';
import config from '../../config';
import { assign } from 'markdown-it/lib/common/utils.mjs';

export interface Task {
    type: string;
    selectedTopic: string;
    statements: string[];
    content: string;
    isOpen: boolean;
    subtype: string;
    data?: string;
    image?: File | null; // Add image to store the uploaded file for specific subtypes
}

const taskTypes = [
    "Writing Task 1 General",
    "Writing Task 1 Academic",
    "Writing Task 2"
];

const Task1AcademicType = [
    "Line Graph",
    "Bar Chart No Timeline",
    "Bar Chart With Timeline",
    "Table No Timeline",
    "Table With Timeline",
    "One Pie Chart",
    "Two Pie Chart",
    "Multiple Graphs",
    "Process Diagram [User input manually]",
    "Map [User input manually]"
];

const Task2Type = [
    "Advantage, disadvantage",
    "Discuss both views",
    "To what extent",
    "Do you agree or disagree / Which do you prefer"
];
const WritingPage: React.FC = () => {
    const [topics, setTopics] = useState<string[]>([]);
    useEffect(() => {
        const token = localStorage.getItem('token'); // Replace with your token retrieval method

        axios.post(`${config.API_BASE_URL}api/get_topic_array_writing`, {}, {
        headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => setTopics(response.data.topic))
        .catch((error) => console.error('Error fetching topics:', error));
    }, []);
    const [tasks, setTasks] = useState<Task[]>([
        {type: 'Writing Task 1 General', selectedTopic: '', statements: [], content: '', isOpen: true, subtype: ''}
    ]);
    const [problemName, setProblemName] = useState('');
    const [accessUser, setAccessUser] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const createProblem = () => {
        // console.log(problemName);
        // console.log(paragraphs);

        //add contest id
        setIsLoading(true);

        const token = localStorage.getItem('token');

        axios.post(`${config.API_BASE_URL}api/createContestWriting`, {
            problemName,
            tasks,
            accessUser,
            startTime,
            endTime,
            "type" : "Writing"
        }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            alert(data['status']);
            console.log(data);
            window.location.reload();
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
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

    const toggleTask = (index: number) => {
        setTasks(tasks.map((para, i) => i === index ? { ...para, isOpen: !para.isOpen } : para));
    };

    const addTask = () => {
        setTasks([...tasks, {type: 'Writing Task 1 General', selectedTopic: '', statements: [], content: '', isOpen: true, subtype: ''}]);
    };

    const deleteTask = (pIndex: number) => {
        setTasks(tasks.filter((_, i) => i !== pIndex));
    };

    const handleAccessUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/,\s*/g, ', '); // Automatically add a space after each comma
        setAccessUser(value);
    };

    const handleInputChange = (pIndex: number, field: 'type' | 'content' | 'subtype' | 'data', value: string) => {
        const newTasks = [...tasks];
        
        // Reset subtype when the main type changes
        if (field === 'type') {
            if(value === 'Writing Task 2')
                newTasks[pIndex] = { ...newTasks[pIndex], type: value, subtype: Task2Type[0], image: null };
            else if(value === 'Writing Task 1 Academic')
                newTasks[pIndex] = { ...newTasks[pIndex], type: value, subtype: Task1AcademicType[0], image: null };
            else
                newTasks[pIndex] = { ...newTasks[pIndex], type: value, subtype: '', image: null }; 
        } else {
            newTasks[pIndex][field] = value;
        }

        setTasks(newTasks);
    };

    const handleGenerateTask = (pIndex: number, type: string, content: string, subtype: string) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        axios.post(`${config.API_BASE_URL}api/generateWritingPrompt`, 
            { type, content, subtype },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const updatedTasks = tasks.map((para, index) => 
                index === pIndex ? { ...para, content: response.data.content } : para
            );
            setTasks(updatedTasks);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => setIsLoading(false));
    };

    const handleFileUpload = (pIndex: number, file: File | null) => {
        // Only update the task if a valid file is selected
        if (file) {
            const updatedTasks = tasks.map((task, index) =>
                index === pIndex ? { ...task, image: file } : task
            );
            setTasks(updatedTasks);
        }
    };

    // Fetch statements based on the selected topic
    const handleTopicChange = async (e: React.ChangeEvent<HTMLSelectElement>, pIndex: number) => {
        const topic = e.target.value;

        let newStatementsArray = []
        if (topic) {
            const token = localStorage.getItem('token'); // Adjust if stored elsewhere

            try {
                const response = await axios.post(`${config.API_BASE_URL}api/get_array_statement_writing_by_topic`, { topic }, {
                headers: { Authorization: `Bearer ${token}` },
                });
                newStatementsArray = response.data.statements || [];
            } catch (error) {
                console.error('Error fetching statements:', error);
            }
        }
        const updatedTasks = tasks.map((task, index) =>
            index === pIndex ? { ...task, selectedTopic: topic, statements: newStatementsArray } : task
        );

        setTasks(updatedTasks);
    };

  // Handle statement selection
  const handleStatementChange = (e: React.ChangeEvent<HTMLSelectElement>, pIndex: number) => {
    const updatedTasks = tasks.map((task, index) =>
        index === pIndex ? { ...task, content: e.target.value } : task
    );
    setTasks(updatedTasks);
  };
    return (
        <>
            <input 
                type="text" 
                placeholder='Name' 
                className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
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
                                    onClick={() => handleGenerateTask(pIndex, task.type, task.content, task.subtype)}
                                    className="px-2 rounded-md ml-2"
                                    disabled={isLoading || task.subtype === "Process Diagram [User input manually]" || task.subtype === "Map [User input manually]"}
                                >
                                    Generate
                                </button>
                            </div>

                            {/* Conditional rendering of subtype select input */}
                            {(task.type === "Writing Task 1 Academic" || task.type === "Writing Task 2") && (
                                <select
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full my-2"
                                    value={task.subtype || ''} // Default to an empty string if subtype is undefined
                                    onChange={(e) => handleInputChange(pIndex, 'subtype', e.target.value)}
                                >
                                    {task.type === "Writing Task 1 Academic" && Task1AcademicType.map((subtype, i) => (
                                        <option key={i} value={subtype}>{subtype}</option>
                                    ))}
                                    {task.type === "Writing Task 2" && Task2Type.map((subtype, i) => (
                                        <option key={i} value={subtype}>{subtype}</option>
                                    ))}
                                </select>
                            )}

                            {/* File upload for "Writing Task 1 Academic" */}
                            {(task.type === "Writing Task 1 Academic") && (
                                <>
                                <div className="border border-gray-200 rounded-md p-4 flex items-center space-x-4">
                                    <div className="flex-1">
                                        {/* Fancy File Upload Button */}
                                        <label className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer inline-block">
                                            Upload Image
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden" 
                                                onChange={(e) => handleFileUpload(pIndex, e.target.files?.[0] || null)}
                                            />
                                        </label>

                                        {/* Display the file name */}
                                        {task.image && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                {task.image.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Image Preview */}
                                    {task.image && (
                                        <div className="flex-shrink-0 w-40 h-40 border rounded-md overflow-hidden">
                                            <img 
                                                src={URL.createObjectURL(task.image)} 
                                                alt="Uploaded Preview" 
                                                className="w-full h-full object-contain" // Maintains aspect ratio
                                            />
                                        </div>
                                    )}
                                </div>
                                <textarea 
                                    placeholder='Data Description' 
                                    className="border border-gray-300 px-4 py-2 rounded-md w-full h-32 my-2" 
                                    value={task.data} 
                                    onChange={(e) => handleInputChange(pIndex, 'data', e.target.value)}
                                    disabled={isLoading}
                                ></textarea>
                                </>
                            )}
                            {/*Choosing available statements from database*/}
                            {task.type === "Writing Task 2" && (
                                <div>
                                    <label>
                                        <select value={task.selectedTopic} onChange={(e) => handleTopicChange(e,pIndex)}>
                                        <option value="">Select a topic</option>
                                        {topics.map((topic, index) => (
                                            <option key={index} value={topic}>
                                            {topic}
                                            </option>
                                        ))}
                                        </select>
                                    </label>

                                    {task.statements.length > 0 && (
                                        <div>
                                            <label>
                                                <select value={task.content} onChange={(e) => handleStatementChange(e, pIndex)}>
                                                    <option value="">Select a statement</option>
                                                    {task.statements.map((statement, index) => (
                                                        <option key={index} value={statement}>
                                                            {statement}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                
                                    )}
                                </div>
                            )}
                            <textarea 
                                placeholder='Prompt' 
                                className="border border-gray-300 px-4 py-2 rounded-md w-full h-64 my-2" 
                                value={task.content} 
                                onChange={(e) => handleInputChange(pIndex, 'content', e.target.value)}
                                disabled={isLoading}
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
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={createProblem} 
                disabled={isLoading}
            >
                Create Problem
            </button>
        </>
    );
};

export default WritingPage;
