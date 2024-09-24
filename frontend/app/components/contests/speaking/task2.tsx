'use client'

import { grader } from './grader';
import React, { useState, useEffect, useRef } from 'react';
import config from '../../../config';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button, ButtonGroup} from "@nextui-org/react";
import {Link} from "@nextui-org/react";
import {CircularProgress} from "@nextui-org/react";

import CircularProgressWithCountdown from './dataDisplayers/circularProgress';
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import ResultPage from './dataDisplayers/result';
import { blob } from 'stream/consumers';
import { M_PLUS_1 } from 'next/font/google';
import WebcamStream from './dataDisplayers/WebcamStream';
import {Textarea} from "@nextui-org/react";
import {Divider} from "@nextui-org/react";
import './cssCustomFiles/dot.css'
import { ClockIcon } from './icons/ClockIcon';
import { MicroIcon } from './icons/MicroIcon';
import PentagonChart from './dataDisplayers/pentagonChart';
import DollarIcon from './icons/DollarIcon';

export interface task2QuestionGeneral {
    type: string;
    number_of_task: string;
    length: number;
    questions: string[];
    audioData: string[];
}

export interface Description {
    problemName: string;
    created_by: string;
    startTime: string;
    endTime: string;
}

interface Task2PageProps {
    task: task2QuestionGeneral;
    task_id: number;
    id: string | null;
    description: Description;
    onTaskUpdate: (task: task2QuestionGeneral) => void;
}

interface Band {
    pronunciation: number;
    fluency: number;
    lexical: number;
    grammar: number;
    response: number;
}

interface Feedback {
    pronunciation: string;
    fluency: string;
    lexical: string;
    grammar: string;
    response: string;
}

const Task2Page: React.FC<Task2PageProps> = ({ task, task_id, id, onTaskUpdate, description }) => {
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<any>(null);
    const [result, setResult] = useState<any[]>([]);
    const [blobArray, setBlobArray] = useState<any[]>([]);
    const [blobRefArray, setBlobRefArray] = useState<any[]>([]);
    const [doneRecording, setDoneRecording] = useState(false);
    const [saveRecord, setSaveRecord] = useState(true);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';
    const [questionAudio, questionUserAudio] = useState<string[]>(() => 
        new Array(task.number_of_task).fill('')
    );

    const [isTesting, setIsTesting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(task.length);
    const [isRecording, setIsRecording] = useState(false);
    const [pentagonArray, setPentagonArray] = useState([0, 0, 0, 0, 0])
    const [preProcess, setPreProcess] = useState(false);
    const [isProcess, setIsProcess] = useState(false);
    const [isTakeNote, setIsTakeNote] = useState(false);
    const [takeNoteTimeLeft, setTakeNoteTimeLeft] = useState(0);

    const hasInitialize = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const noteRef = useRef<NodeJS.Timeout | null>(null);

    const [feedback, setFeedback] = useState<Feedback>({ 
        pronunciation: "", 
        fluency: "",
        lexical: "",
        grammar: "",
        response: "",
    });
    const [band, setBand] = useState<Band>({ 
        pronunciation: 0, 
        fluency: 0,
        lexical: 0,
        grammar: 0,
        response: 0,
    });

    useEffect(() => {
        if (!hasInitialize.current) {
            getSpeakingGrading();
            hasInitialize.current = true;
        }
    }, []);

    useEffect(() => {
    });

    useEffect(() => {
        if (isLoading) {
            intervalRef.current = setInterval(() => {
                setProgress((prevProgress) => {
                    return prevProgress + 10;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoading]);

    useEffect(() => {
        if (isTesting && !isTakeNote) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTesting]);    

    useEffect(() => {
        if (isTakeNote) {
            noteRef.current = setInterval(() => {
                setTakeNoteTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            if (noteRef.current) {
                clearInterval(noteRef.current);
            }
        }

        return () => {
            if (noteRef.current) {
                clearInterval(noteRef.current);
            }
        };
    }, [isTakeNote]);    

    const startRecording = async () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingError(null);
        setResponseData(null);
        setDoneRecording(false);
        setSaveRecord(false);
        audioChunksRef.current = [];

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg;' });
                setAudioBlob(audioBlob);
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                setBlobArray(prevBlobArray => [...prevBlobArray, audioBlob]);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } else {
            setRecordingError('Your browser does not support audio recording.');
        }
    };

    const stopRecording = ( text: boolean ) => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        if(!text) {
            setDoneRecording(true);
            return 0;
        }
        let played = false;
        setCurrentQuestionIndex((prevIndex) => {
            if (prevIndex < task.questions.length - 1) {
                if(!played) {
                    played = true;
                }
                return prevIndex + 1;
            } else {
                setIsTesting(false);
                setIsLoading(false);
                setDoneRecording(true);
                return prevIndex;
            }
        });
    };    

    const convertBlobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    

    const handleStartClick = () => {
        setBlobArray([]);
        setResult([]);
        setIsTesting(true);
        setIsLoading(true);
        setProgress(0);
        setCurrentQuestionIndex(0);
        setTakeNoteTimeLeft(60);

        setTimeout(() => {
            setIsTakeNote(true);
            setIsLoading(false);
            
            setTimeout(() => {
                setTimeLeft(task.length);
                setIsTakeNote(false);
                setTimeout(() => {
                    handleStopClick();
                }, task.length * 1000)
            }, 60000)
        }, 10000);
    };

    const handleStopClick = async () => {
        setIsTesting(false);
        setIsLoading(false);
        stopRecording( false );
    };

    const processBlob = async () => {
        setIsProcess(true);
        if(!doneRecording) return;
        for(let i=0; i<blobArray.length; i++) {
            const audioBlob = blobArray[i];
            const audioBase64 = await convertBlobToBase64(audioBlob);
            let audioData = "";

            if (audioBase64.length < 6) {
                setRecordingError('Recording is too short.');
                return;
            }

            await fetch(`${config.API_PRONOUNCE_BASE_URL}/saveToGGDrive`, {
                method: "post",
                body: JSON.stringify({ "audioBase64": audioBase64 }),
                headers: { "X-Api-Key": STScoreAPIKey }
            }).then(res => res.json())
                .then(data => {
                    audioData = data['audioData'];
                });

            const res = await fetch(`${config.API_PRONOUNCE_BASE_URL}/GetAccuracyFromRecordedAudio`, {
                method: "post",
                body: JSON.stringify({ "title": "", "base64Audio": audioBase64, "language": 'en' }),
                headers: { "X-Api-Key": STScoreAPIKey }
            });
            const data = await res.json();
            setResponseData(data);
            const [band, feedback] = await grader(data, task.questions[i]);

            result.push({ data, band, feedback, audioData });

        }
        setDoneRecording(false);
        setIsProcess(false);
        save_record();
    }

    const save_record = async() => {
        const token = localStorage.getItem('token');
        await fetch(`${config.API_BASE_URL}api/add_new_speaking_answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, result, task_id, task}),   
        });
        setSaveRecord(true);
    }

    const formatDateRange = (startTime: string, endTime: string) => {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return `${startDate.toLocaleString(undefined, options)} - ${endDate.toLocaleString(undefined, options)}`;
    };

    const getSpeakingGrading = async() => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingGrading`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, task_id }),
        });
        const result = await response.json();
        const band = result.band;
        let pronunciation = 0, fluency = 0, lexical = 0, grammar = 0, taskResponse = 0;
        let mpronunciation = 0, mfluency = 0, mlexical = 0, mgrammar = 0, mtaskResponse = 0;
        for(let i=0; i<band.length; i++) {
            for(let j=0; j<Number(task.number_of_task); j++) {
                if(band[i][j].band) {
                    pronunciation += band[i][j].band.pronunciation;
                    fluency += band[i][j].band.fluency;
                    lexical += band[i][j].band.lexical;
                    grammar += band[i][j].band.grammar;
                    taskResponse += band[i][j].band.response;
                    mpronunciation += 9;
                    mfluency += 9;
                    mlexical += 9;
                    mgrammar += 9;
                    mtaskResponse += 9;
                }
            }
        }
        pentagonArray[0] = convertToIELTSBand(pronunciation, mpronunciation);
        pentagonArray[1] = convertToIELTSBand(fluency, mfluency);
        pentagonArray[2] = convertToIELTSBand(lexical, mlexical);
        pentagonArray[3] = convertToIELTSBand(grammar, mgrammar);
        pentagonArray[4] = convertToIELTSBand(taskResponse, mtaskResponse);
        setPreProcess(true);
    }

    const convertToIELTSBand = (score: number, maxScore: number) => {
        const d = maxScore / 9;
        if(d == 0) return 0;
        const x = Math.floor(score / d);
        const lowerBound = x * d;
        const upperBound = (x + 1) * d;
        const middle1 = lowerBound + d / 3;
        const middle2 = lowerBound + 2 * (d / 3);
        let band = x;
        if (score >= middle1 && score <= middle2) {
            band += 0.5;
        } else if (score > middle2 && score <= upperBound) {
            band += 1;
        }
        return Math.round(Math.min(Math.max(band, 1), 9));
    }

    function insertNewlineBeforeDash(input: string): string {
        let result = '';
        
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '-' && input[i - 1] !== '\n') {
                result += '\n';
            }
            result += input[i]; 
        }
        
        return result;
    }

    return (
        <div>
            <div className='ml-20 mr-20 mb-10'>
                <Divider />
            </div>
            <div className='flex max-w-full justify-between items-center m-4 ml-20 mr-20 mb-5'>
                <div>
                    <div className="text-3xl font-bold mb-6">
                        {description && description.problemName ? description.problemName : null}
                    </div>
                    <div className="text-lg dot-before">
                        Author: {description && description.created_by ? (
                                    <Link className="text-lg" href={`/loader/profile?id=${description.created_by}`}>
                                        {description.created_by}
                                    </Link>
                                )
                                    : null
                                }
                    </div>
                    <div className="text-lg dot-before">
                        Type: Speaking Task 2
                    </div>
                    <div className="text-lg dot-before mb-6">
                        {description ? formatDateRange(description.startTime, description.endTime) : null}
                    </div>
                    <Button
                        onClick={isTesting ? handleStopClick : handleStartClick}
                        isDisabled={isLoading}
                        className="mr-4"
                        color="primary"
                        style={{ fontSize: '1rem' }}    
                    >
                        {isTesting ? 'Stop the task' : 'Start the task'}
                    </Button>
                    {doneRecording && !isTesting ? (
                        <Button 
                            onClick={processBlob}
                            className="mr-4"
                            color="primary"
                            style={{ fontSize: '1rem' }}
                            isDisabled={isProcess}
                        >
                            Process & save record
                        </Button>
                    ) : (
                        null
                    )}
                </div>


                {preProcess ? (
                    <div className='flex justify-between items-center'>
                        <PentagonChart data={pentagonArray} />
                        {/* <PentagonChart /> */}
                    </div>
                ) : (
                    null
                )}
            </div>

            <div className='ml-20 mr-20 mb-10'>
                <Divider />
            </div>

            <div className='flex flex-row max-w-full justify-between items-center ml-20 mr-20'>
                <div className='flex items-center mb-6'>
                    <ClockIcon />
                    <div className='flex flex-col ml-4'>
                        <div className="text-lg">
                            Speaking Time
                        </div>
                        <div className="text-3xl font-bold">
                            {task.length} sec
                        </div>
                    </div>
                </div>

                <div className='flex items-center mb-6'>
                    <MicroIcon />
                    <div className='flex flex-col ml-4'>
                        <div className="text-lg">
                            Number
                        </div>
                        <div className="text-3xl font-bold">
                            {task.number_of_task} records
                        </div>
                    </div>
                </div>

                <div className='flex items-center mb-6'>
                    <DollarIcon />
                    <div className='flex flex-col ml-4'>
                        <div className="text-lg">
                            Cost of the task
                        </div>
                        <div className="text-3xl font-bold">
                            Free
                        </div>
                    </div>
                </div>
            </div>


            {/* Body */}
            <div className='m-5 ml-20 mr-20'>
                <Divider className='mb-10'/>
                {isTesting ? (
                    <div>
                        {isLoading ? (
                            <div className='flex flex-col items-center'>
                                <CircularProgressWithCountdown 
                                    progress={progress} 
                                    size={150}
                                    backgroundColor='#006fee'
                                    foregroundColor='#dcdcdc'
                                />
                            </div>
                        ) : (
                            <div className='flex mt-8'>
                                <WebcamStream/>
                                <div className='flex flex-col w-1/2 ml-4'>
                                    <div className='flex items-center mb-4'>
                                        <div className='mr-4 w-auto'>
                                            <Button 
                                                onClick={startRecording}
                                                isDisabled={isTakeNote || isRecording || timeLeft <= 0}
                                                color="success"
                                                style={{ fontSize: '1rem' }}
                                            >
                                                Start recording
                                            </Button>
                                        </div>
                                        <div className='flex-grow text-center mx-4' style={{ fontSize: '1rem' }}>
                                            {!isTakeNote ? (
                                                <div>
                                                    Time left: {timeLeft}s
                                                </div>
                                            ) : (
                                                null
                                            )}
                                        </div>
                                        <div className='ml-auto'>
                                            <Button 
                                                onClick={(e) => stopRecording(true)}
                                                isDisabled={!isRecording}
                                                color="danger"
                                                style={{ fontSize: '1rem' }}
                                            >
                                                Next question
                                            </Button>
                                        </div>
                                    </div>

                                    <Divider className='mb-4'/>

                                    <div className="mb-4">
                                        <strong>
                                            {insertNewlineBeforeDash(task.questions[0]).split('\n').map((line, index) => (
                                                <React.Fragment key={index}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </strong>
                                    </div>

                                    <Divider className='mb-4'/>
                                    
                                    <div className='mb-4 text-red-500'>
                                        {isTakeNote ? (
                                            <div>
                                                You have {takeNoteTimeLeft} seconds to prepare for you speaking.
                                            </div>
                                        ) : (
                                            <div>
                                                You should start you speaking now!
                                            </div>
                                        )}
                                    </div>

                                    <Textarea
                                        style={{ fontSize: '1rem' }}
                                        placeholder="Enter your note"
                                        className="max-w-full h-40"
                                        isDisabled={!isTakeNote}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div key={task_id}>
                            <ResultPage task={task} task_id={task_id} id={id}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Task2Page;
