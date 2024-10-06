'use client'

import React, { useState, useRef, useEffect } from 'react';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import { Progress } from "@nextui-org/react";
import axios from 'axios';
import config from '../../config';
import Task1Page from './listening/task1';
// import Task2Page from './listening/task2';
// import Task3Page from './listening/task3';
// import Task4Page from './listening/task4';

import { mergeBase64 } from './listening/mergeBase64';

const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const ListeningPage: React.FC = () => {
    const [generatedTask, setGeneratedTask] = useState('');
    const [taskArray, setTaskArray] = useState<any[]>([]);
    const [idList, setIdList] = useState<{ id: string, listening_id: string }[]>([]);
    const [selectedTask, setSelectedTask] = useState<string>('Task 1');
    const [problemName, setProblemName] = useState('');
    const [accessUser, setAccessUser] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';
    const [isLoading, setIsLoading] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [isCreating, setIsCreating] = useState(false);

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            hasInitialize.current = true;
        }
    }, []);

    const handleTaskUpdate = (task: any, idx: number) => {
        setTaskArray(prevArray => {
            const updatedArray = [...prevArray];
            updatedArray[idx] = task;
            return updatedArray;
        });
    };

    const handleAddTask = () => {
        if (selectedTask) {
            const listening_id = generateRandomString(8);
            setIdList(prevIdList => {
                const newIdList = [...prevIdList, { id: selectedTask, listening_id }];
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
            // case 'Task 2':
            //     return <Task2Page onTaskUpdate={(task: any) => handleTaskUpdate(task, idx)} />;
            // case 'Task 3':
            //     return <Task3Page onTaskUpdate={(task: any) => handleTaskUpdate(task, idx)} />;
            default:
                return null;
        }
    };

    const getAudioFromText = async (text: string, speaker: string): Promise<string> => {
        try {
            const response = await fetch(`${config.API_PRONOUNCE_BASE_URL}api_pronounce/getAudioFromTextWithCustomVoice`, {
                method: "POST",
                body: JSON.stringify({ "text": text, "speaker": speaker }),
                headers: { 
                    "X-Api-Key": STScoreAPIKey,
                    "Content-Type": "application/json" 
                }
            });
            if (!response.ok) {
                console.error("Failed to fetch audio:", response.statusText);
                return "";
            }
            const data = await response.json();
            return data.audioBase64 ?? "";
        } catch (error) {
            console.error("Error fetching audio:", error);
            return "";
        }
    }

    const getAudioDurationFromBase64 = async (audioBase64: string) => {
        try {
            const base64String = audioBase64.split(',')[1];
    
            const binaryString = atob(base64String);
            const binaryLen = binaryString.length;
            const bytes = new Uint8Array(binaryLen);
            for (let i = 0; i < binaryLen; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;
    
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log(audioBuffer.duration);
            return Math.round(audioBuffer.duration);
        } catch (error) {
            console.error('Error decoding audio base64:', error);
            return 0;
        }
    };
    

    const createListeningContest = async () => {
        console.log(taskArray);
        setIsCreating(true);

        let audioBase64 = "";
        for(let i=0; i<taskArray.length; i++) {
            let message = "This is the IELTS listening " + taskArray[i].type;
            audioBase64 = await getAudioFromText(message, "p231");

            message = "First, you will have some time to look at questions";
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(message, "p231"), 0.5);
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(`one`, "p231"), 0.2);
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(`to`, "p231"), 0.2);
            message = taskArray[i].exercise[0].numberOfQuestion.toString();
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(message, "p231"), 0.2);

            let pos = 0;
            for(let j=0; j<taskArray[i].script.scripts.length; j++) {
                let name = taskArray[i].script.scripts[j].name;
                let sentence = taskArray[i].script.scripts[j].message;
                let currentSpeaker = taskArray[i].script.character1.speaker;
                if(name === "spliter") {
                    pos = j + 1;
                    break;
                }
                if(name === taskArray[i].script.character2.name) currentSpeaker = taskArray[i].script.character2.speaker;
                audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(sentence, currentSpeaker), (j === 0 ? 30 : 0.5));
            }
            message = "Before hearing the rest of the audio, you will have some time to look at questions";
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(message, "p231"), 3);
            message = (taskArray[i].exercise[0].numberOfQuestion + 1).toString();
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(message, "p231"), 0.2);
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(`to`, "p231"), 0.2);
            message = (taskArray[i].exercise[0].numberOfQuestion + taskArray[i].exercise[1].numberOfQuestion).toString();
            audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(message, "p231"), 0.2);

            for(let j=pos; j<taskArray[i].script.scripts.length; j++) {
                let name = taskArray[i].script.scripts[j].name;
                let sentence = taskArray[i].script.scripts[j].message;
                let currentSpeaker = taskArray[i].script.character1.speaker;
                if(name === taskArray[i].script.character2.name) currentSpeaker = taskArray[i].script.character2.speaker;
                audioBase64 = await mergeBase64(audioBase64, await getAudioFromText(sentence, currentSpeaker), (j === pos ? 30 : 0.5));
            }

            await fetch(`${config.API_PRONOUNCE_BASE_URL}api_pronounce/saveToGGDrive`, {
                method: "post",
                body: JSON.stringify({ "audioBase64": audioBase64}),
                headers: { "X-Api-Key": STScoreAPIKey }
            }).then(res => res.json())
                .then(data => {
                    console.log(data['audioData']);
                    taskArray[i].audioData = data['audioData'];
                });

            taskArray[i].audioLength = await getAudioDurationFromBase64(audioBase64);
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/createListeningProblem`, {
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
        setIsCreating(false);
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
                    <div key={item.listening_id} className="border border-gray-300 rounded-md p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{`Listening #${idx + 1} (${item.id})`}</h3>
                            <div>
                              <Button
                                  onClick={() => handleDeleteTask(idx)}
                                  className="mr-2 text-medium"
                                  color='danger'
                              >
                                  Delete
                              </Button>
                            </div>
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
                    {/* <option value="Task 2">Task 2</option>
                    <option value="Task 3">Task 3</option> */}
                </select>
                <button
                    onClick={handleAddTask}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                    Add
                </button>
            </div>
            <button
                onClick={createListeningContest}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                disabled={isCreating}
            >
                Create Problem
            </button>
            {isCreating 
                ? <Progress
                    size="sm"
                    isIndeterminate
                    aria-label="Loading..."
                    className="max-w-md mt-4"
                />
                : null
            }
        </div>
    );
};

export default ListeningPage;
