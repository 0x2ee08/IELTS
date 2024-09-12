'use client'

import React, { useState, useEffect, useRef } from 'react';
import config from '../../../config';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import CircularProgressWithCountdown from './component/circularProgress';
import ResultPage from './component/result';
import { blob } from 'stream/consumers';
import { M_PLUS_1 } from 'next/font/google';

export interface task1QuestionGeneral {
    type: string;
    number_of_task: string;
    length: number;
    questions: string[];
}

interface Task1PageProps {
    task: task1QuestionGeneral;
    task_id: number;
    problem_id: string | null;
    onTaskUpdate: (task: task1QuestionGeneral) => void;
}

const Task1Page: React.FC<Task1PageProps> = ({ task, task_id, problem_id, onTaskUpdate }) => {
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<any>(null);
    const [result, setResult] = useState<any[]>([]);
    const [blobArray, setBlobArray] = useState<any[]>([]);
    const [blobRefArray, setBlobRefArray] = useState<any[]>([]);
    const [doneRecording, setDoneRecording] = useState(false);
    const [saveRecord, setSaveRecord] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';

    const [isTesting, setIsTesting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(task.length);
    const [isRecording, setIsRecording] = useState(false);

    const hasInitialize = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!hasInitialize.current) {
            hasInitialize.current = true;
        }
    }, []);

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
        if (isTesting) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        stopRecording(false);
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
                    playSpeechFromWord(task.questions[prevIndex + 1]);
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

    const playSpeechFromWord = async (text: string) => {
        await fetch(`${config.API_PRONOUNCE_BASE_URL}/getAudioFromText`, {
            method: "post",
            body: JSON.stringify({ "text": text }),
            headers: { "X-Api-Key": STScoreAPIKey }
        });

        const audio = new Audio('../../../../backend_pronounce/audio.wav');
        audio.play()
            .then(() => console.log('Audio is playing'))
            .catch((error) => console.error('Error playing audio:', error));
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

        setTimeout(() => {
            setIsLoading(false);
            setTimeLeft(task.length);
            playSpeechFromWord(task.questions[0]);
        }, 10000);
    };

    const handleStopClick = async () => {
        setIsTesting(false);
        setIsLoading(false);
        stopRecording( false );
    };

    const processBlob = async () => {
        if(!doneRecording) return;
        console.log(blobArray)
        for(let i=0; i<blobArray.length; i++) {
            const audioBlob = blobArray[i];
            const audioBase64 = await convertBlobToBase64(audioBlob);

            if (audioBase64.length < 6) {
                setRecordingError('Recording is too short.');
                return;
            }

            await fetch(`${config.API_PRONOUNCE_BASE_URL}/GetAccuracyFromRecordedAudio`, {
                method: "post",
                body: JSON.stringify({ "title": "", "base64Audio": audioBase64, "language": 'en' }),
                headers: { "X-Api-Key": STScoreAPIKey }
            }).then(res => res.json())
                .then(data => {
                    setResponseData(data);
                    setResult(prevResult => [...prevResult, { data, audioBase64 }]);
                });
        }
        setDoneRecording(false);
    }

    const save_record = async() => {
        console.log(problem_id, result);
        const token = localStorage.getItem('token');
        await fetch(`${config.API_BASE_URL}api/add_new_speaking_answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problem_id, result, task_id}),
        });
        setSaveRecord(true);
    }

    return (
        <div>
            <div className='border border-gray-300 px-4 py-2 rounded-md m-4 ml-20 mr-20 mb-5'>
                <button
                    onClick={isTesting ? handleStopClick : handleStartClick}
                    className="px-2 py-1 text-black rounded-md"
                >
                    {isTesting ? 'Stop the task' : 'Start the task'}
                </button>
            </div>
            <div className='border border-gray-300 px-4 py-2 rounded-md m-4 ml-20 mr-20'>
                {isTesting ? (
                    <div>
                        {isLoading ? (
                            <div className='flex flex-col items-center'>
                                <CircularProgressWithCountdown 
                                    progress={progress} 
                                    size={120}
                                    backgroundColor='#7695FF'
                                    foregroundColor='#B5C0D0'
                                />
                            </div>
                        ) : (
                            <div>
                                <div className='flex flex-col items-center'>
                                    <button 
                                        onClick={startRecording}
                                        // disabled={isRecording || timeLeft <= 0}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md"
                                    >
                                        Start Recording
                                    </button>
                                    <button 
                                        onClick={(e) => stopRecording(true)}
                                        // disabled={!isRecording}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md mt-2"
                                    >
                                        Stop Recording
                                    </button>
                                    <Typography variant="h6" className="mt-4">
                                        Time Left: {timeLeft}s
                                    </Typography>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {task.questions.length > 0 ? (
                            task.questions.map((question, idx) => (
                                <div key={idx}>
                                    <p>Question {idx + 1}: {question}</p>
                                </div>
                            ))
                        ) : (
                            <p>No questions found.</p>
                        )}
                        <button 
                            onClick={processBlob}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md mr-4 mt-4"
                        >
                            Process Record
                        </button>
                        {!saveRecord && !doneRecording ? (
                            <button 
                                onClick={save_record}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md mr-4 mt-4"
                            >
                                Save Record
                            </button>
                        ) : (
                            null
                        )}
                        <div key={task_id}>
                            <ResultPage task={task} task_id={task_id} problem_id={problem_id}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Task1Page;
