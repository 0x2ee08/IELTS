import { Button, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps, useDisclosure } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';
import { typeOfAudio, difficulty, tone } from "./data/data";
import { conversationConverter } from "./converter/conversationConverter";
import { task1QuestionGeneral, Task1PageProps } from './data/interfaces1';
import "./cssCustomFiles/input.css";

const Task1Page: React.FC<Task1PageProps> = ({ onTaskUpdate }) => {
    const [task, setTask] = useState<task1QuestionGeneral>({
        type: "Task 1",
        number_of_task: '',
        questions: [],
        audioData: "",
        typeOfAudio: "conversation",
        difficulty: "",
        languageTone: "",
        topic: "",
        script: {
            TITLE: "",
            DESCRIPTION: "",
            CHARACTER1: { NAME: "", GENDER: "", },
            CHARACTER2: { NAME: "", GENDER: "", },
            SCRIPTS: [],
        },
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
                TITLE: e.target.value,
            },
        }));
    };

    const handleChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask(prevTask => ({
            ...prevTask,
            script: {
                ...prevTask.script,
                DESCRIPTION: e.target.value,
            },
        }));
    };

    const handleChangeScript = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setTask(prevTask => {
            const updatedScripts = [...prevTask.script.SCRIPTS];
            updatedScripts[idx].MESSAGE = e.target.value;
            return {
                ...prevTask,
                script: {
                    ...prevTask.script,
                    SCRIPTS: updatedScripts,
                },
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
                value={task.script.TITLE}
                onChange={handleChangeTitle}
            />
            <Textarea
                label={<span className="custom-label">Description</span>}
                labelPlacement={"outside-left"}
                variant="bordered" fullWidth={true} className="mb-4" maxRows={1}
                value={task.script.DESCRIPTION}
                onChange={handleChangeDescription}
            />
            <Input
                label={<span className="custom-label">Characters: </span>}
                labelPlacement={"outside-left"}
                variant="bordered" fullWidth={true} className="mb-4"
                value={task.script.CHARACTER1.NAME + ' and ' + task.script.CHARACTER2.NAME}
            />
            <span className="custom-label">
                Script: <Button className="ml-2 mb-4" onPress={onOpen}>Click here to see</Button>
            </span>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={scrollBehavior} size="5xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Script
                                <Divider />
                            </ModalHeader>
                            <ModalBody>
                                {task.script.SCRIPTS.map((message, idx) => (
                                    <div key={idx}>
                                        <Textarea
                                            label={<span className="custom-label font-bold">{message.NAME}:</span>}
                                            labelPlacement={"outside-left"}
                                            variant="bordered" fullWidth={true} className="mb-2" maxRows={4}
                                            value={task.script.SCRIPTS[idx].MESSAGE}
                                            onChange={handleChangeScript(idx)}
                                        />
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
            
        </div>
    );
};

export default Task1Page;
