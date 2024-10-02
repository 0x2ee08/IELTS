import { Button, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps, useDisclosure } from "@nextui-org/react";
import { Divider, Tooltip } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';
import { typeOfAudio, difficulty, tone, typeOfQuestion } from "./data/data";
import "./cssCustomFiles/input.css";
import { TrashBin } from "./cssCustomFiles/trashBin";

import { task1QuestionGeneral, Task1PageProps } from './data/interfaces1';
import { mcq, saq } from './data/typeOfQuestion';

import { conversationConverter } from "./converter/conversationConverter";
import { mcqConverter } from "./converter/mcqConverter";

import mcqPage from "./questionDisplayer/mcq"

const Task1Page: React.FC<Task1PageProps> = ({ onTaskUpdate }) => {
    const [task, setTask] = useState<task1QuestionGeneral>({
        type: "Task 1",
        audioData: "",
        typeOfAudio: "conversation",
        difficulty: "",
        languageTone: "",
        topic: "",
        script: {
            title: "",
            description: "",
            character1: { name: "", gender: "", },
            character2: { name: "", gender: "", },
            scripts: [],
        },
        exercise: [
            {typeOfQuestion: "", numbefOfQuestion: 0, difficulty: "", data: null},
            {typeOfQuestion: "", numbefOfQuestion: 0, difficulty: "", data: null},
        ],
    });

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [scrollBehavior, setScrollBehavior] = React.useState<ModalProps["scrollBehavior"]>("inside");

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            hasInitialize.current = true;
        }
    }, []);

    useEffect(() => {
        onTaskUpdate(task);
    }, [task]);

    const generateListeningTask1 = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/generateListeningTask1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ task }),
        });
        const result = await response.json();

        const convertedScript = await conversationConverter(result.content);
        setTask((prevTask) => ({
            ...prevTask,
            script: convertedScript,
        }));
    };

    const generateExercise = async (idx: number) => {
        let script = ``;
        for(let i=0; i<task.script.scripts.length; i++) {
            let message = task.script.scripts[i];
            if(message.name === "spliter") break;
            script = script + message.name.toString() + ": " + message.message.toString() + "\n";
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/generateExercise`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ task, idx, script }),
        });
        const result = await response.json();

        const convertedData = await mcqConverter(result.content);


        setTask((prevTask) => {
            const updatedExercise = prevTask.exercise;
            if (updatedExercise[idx]) {
                updatedExercise[idx].data = convertedData;
            }
            return {
                ...prevTask,
                exercise: updatedExercise,
            };
        });
        console.log(task.exercise[0].data)
    };

    const handleChooseTypeOfAudio = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            typeOfAudio: e.target.value,
        }));
    };

    const handleChooseDifficulty = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            difficulty: e.target.value,
        }));
    };

    const handleChooseLanguageTone = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            languageTone: e.target.value,
        }));
    };

    const handleChangeTopic = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            topic: e.target.value,
        }));
    };

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            script: {
                ...prevTask.script,
                title: e.target.value,
            },
        }));
    };

    const handleChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            script: {
                ...prevTask.script,
                description: e.target.value,
            },
        }));
    };

    const handleChangeScript = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask(prevTask => {
            const updatedScripts = [...prevTask.script.scripts];
            updatedScripts[idx].message = e.target.value;
            return {
                ...prevTask,
                script: {
                    ...prevTask.script,
                    scripts: updatedScripts,
                },
            };
        });
    };

    const handleDeleteMessage = (idx: number) => {
        setTask((prevTask) => {
            const updatedScripts = [...prevTask.script.scripts];
            updatedScripts.splice(idx, 1);
            return {
                ...prevTask,
                script: {
                    ...prevTask.script,
                    scripts: updatedScripts,
                },
            };
        });
    };

    const handleChangeTypeOfQuestion = (idx: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTask((prevTask) => {
            const updatedExercise = prevTask.exercise ? [...prevTask.exercise] : [];
            
            if (updatedExercise[idx]) {
                updatedExercise[idx].typeOfQuestion = e.target.value;
            }
            return {
                ...prevTask,
                exercise: updatedExercise,
            };
        });
    };

    const handleChangeNumberOfQuestion = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask((prevTask) => {
            const updatedExercise = prevTask.exercise ? [...prevTask.exercise] : [];
            if (updatedExercise[idx]) {
                updatedExercise[idx].numbefOfQuestion = Number(e.target.value);
            }
            return {
                ...prevTask,
                exercise: updatedExercise,
            };
        });
    };

    const handleChangeDifficultyOfQuestion = (idx: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTask((prevTask) => {
            const updatedExercise = prevTask.exercise ? [...prevTask.exercise] : [];
            if (updatedExercise[idx]) {
                updatedExercise[idx].difficulty = e.target.value;
            }
            return {
                ...prevTask,
                exercise: updatedExercise,
            };
        });
    };

    return (
        <div>
            <Divider className="mt-4 mb-4" />
            <div className="flex flex-col mb-4">
                <div className='flex items-center justify-center'>
                    <Input className="mr-2" variant="bordered" label="Enter topic" onChange={handleChangeTopic} />
                    <Select
                        label="Select the type of audio"
                        className="max-w-xs text-xl mr-2"
                        variant="bordered"
                        defaultSelectedKeys={["conversation"]}
                        onChange={handleChooseTypeOfAudio}
                        isDisabled
                    >
                        {typeOfAudio.map((data) => (
                            <SelectItem key={data.key}>
                                {data.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Select
                        label="Select difficulty"
                        className="max-w-xs text-xl mr-2"
                        variant="bordered"
                        value={task.difficulty}
                        onChange={handleChooseDifficulty}
                    >
                        {difficulty.map((data) => (
                            <SelectItem key={data.key}>
                                {data.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Select
                        label="Select language tone"
                        className="max-w-xs text-xl mr-2"
                        variant="bordered"
                        value={task.languageTone}
                        onChange={handleChooseLanguageTone}
                    >
                        {tone.map((data) => (
                            <SelectItem key={data.key}>
                                {data.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Button
                        onClick={generateListeningTask1}
                        className="mr-2 text-medium"
                        color="primary"
                    >
                        Generate
                    </Button>
                </div>
            </div>
            <Textarea
                label={<span className="custom-label">Title</span>}
                labelPlacement={"outside-left"}
                variant="bordered" fullWidth={true} className="mb-4" maxRows={1}
                value={task.script.title}
                onChange={handleChangeTitle}
            />
            <Textarea
                label={<span className="custom-label">Description</span>}
                labelPlacement={"outside-left"}
                variant="bordered" fullWidth={true} className="mb-4" maxRows={1}
                value={task.script.description}
                onChange={handleChangeDescription}
            />
            <Input
                label={<span className="custom-label">Characters: </span>}
                labelPlacement={"outside-left"}
                variant="bordered" fullWidth={true} className="mb-4"
                value={task.script.character1.name + ' and ' + task.script.character2.name}
            />
            <div className="custom-label">
                Script: <Button className="ml-2 mb-4" onPress={onOpen} variant="bordered">Click here to see</Button>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={scrollBehavior} size="5xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Script
                                <Divider />
                            </ModalHeader>
                            <ModalBody>
                                {task.script.scripts.map((message, idx) => (
                                    <div key={idx} className="flex flex-row items-center justify-center">
                                        <Textarea
                                            label={<span className="custom-label font-bold">{message.name}:</span>}
                                            labelPlacement={"outside-left"}
                                            variant="bordered" fullWidth={true} className="mb-2" maxRows={4}
                                            value={task.script.scripts[idx].message}
                                            onChange={handleChangeScript(idx)}
                                        />
                                        <Tooltip content={'Delete'} placement="right">
                                        <span 
                                            className="text-lg text-default-400 cursor-pointer active:opacity-50 ml-2"
                                            onClick={() => handleDeleteMessage(idx)}
                                        >
                                            <TrashBin />
                                        </span>
                                </Tooltip>
                                    </div>
                                ))}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Answer section :sob: */}
            {[0, 1].map((_, idx) => (
                <div key={idx}>
                    <div className="flex flex-row items-center justify-center mb-4">
                        <span className="mr-2 font-bold">
                            Exercise {idx + 1}:
                        </span>
                        <Input 
                            className="mr-2 max-w-[12rem]" 
                            variant="bordered"
                            label="Enter number of questions" 
                            onChange={handleChangeNumberOfQuestion(idx)} // Use idx here
                        />
                        <Select
                            label="Select type of question"
                            className="max-w-xs text-xl mr-2"
                            variant="bordered"
                            value={task.exercise[idx]?.typeOfQuestion}
                            onChange={handleChangeTypeOfQuestion(idx)}
                        >
                            {typeOfQuestion.map((data) => (
                                <SelectItem key={data.key}>
                                    {data.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="Select difficulty"
                            className="max-w-xs text-xl mr-2"
                            variant="bordered"
                            value={task.exercise[idx]?.difficulty} 
                            onChange={handleChangeDifficultyOfQuestion(idx)} 
                        >
                            {difficulty.map((data) => (
                                <SelectItem key={data.key}>
                                    {data.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Button
                            onClick={() => generateExercise(idx)}
                            className="mr-2 text-medium"
                            color="primary"
                        >
                            Generate
                        </Button>
                    </div>
                    <div className="mb-6">
                        {task.exercise[idx]?.typeOfQuestion === "Multiple choice" && task.exercise[idx]
                            ? mcqPage({ exercise: task.exercise[idx].data })
                            : null
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Task1Page;
