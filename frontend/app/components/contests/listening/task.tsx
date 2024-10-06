'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import { Slider, SliderValue } from "@nextui-org/react";
import config from '../../../config';

import { PlayIcon } from "./icon/start";
import { PauseIcon } from "./icon/pause";
import { VolumeIcon } from "./icon/volume";

import McqQuestion from "./questionDisplayer/mcq"
import SaqQuestion from "./questionDisplayer/saq"

const ListeningTaskContest = ({ contest, currentPage }: { contest: any; currentPage: number }) => {
    const hasInitialized = useRef(false);
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [currentSecond, setCurrentSecond] = useState(0);
    const [currentVolume, setCurrentVolume] = useState<SliderValue>(10);
    const [isPlaying, setIsPlaying] = useState(false);

    const [userAnswer, setUserAnswer] = useState([
        new Array(contest.taskArray[currentPage].exercise[0].numberOfQuestion).fill(""),
        new Array(contest.taskArray[currentPage].exercise[1].numberOfQuestion).fill("")
    ]);

    const audioLength = contest.taskArray[currentPage].audioLength;

    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';

    useEffect(() => {
        if (!hasInitialized.current) {
            const fetchAudio = async () => {
                try {
                    const response = await fetch(`${config.API_PRONOUNCE_BASE_URL}api_pronounce/getAudioFromDrive`, {
                        method: "post",
                        body: JSON.stringify({ "url": contest.taskArray[currentPage].audioData }),
                        headers: { "X-Api-Key": STScoreAPIKey }
                    });
                    const data = await response.json();
                    setAudioBase64(data['audioBase64']);
                    // console.log('Fetched audioBase64:', data['audioBase64']);
                } catch (error) {
                    console.error("Failed to fetch audio:", error);
                }
            };

            fetchAudio();
            hasInitialized.current = true;
        }
    }, [contest.taskArray, currentPage, STScoreAPIKey]);

    useEffect(() => {
        if (audioBase64) {
            const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;
            audioRef.current = new Audio(audioDataUrl);
            audioRef.current.volume = Number(currentVolume) / 10;

            audioRef.current.addEventListener('timeupdate', () => {
                setCurrentSecond(Math.round((audioRef.current!.currentTime )));
            });
            // real/length = second/1000
            return () => {
                audioRef.current?.pause();
                audioRef.current?.removeEventListener('timeupdate', () => {});
                audioRef.current = null;
            };
        }
    }, [audioBase64, audioLength]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Number(currentVolume) / 10;
        }
    }, [currentVolume]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    const handleSliderChange = (value: number | number[]) => {
        const newCurrentSecond = Array.isArray(value) ? value[0] : value;
        setCurrentSecond(newCurrentSecond);

        if (audioRef.current) {
            audioRef.current.currentTime = newCurrentSecond
        }
    };

    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
    
        // Format minutes and seconds to always have two digits
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    const handleSubmit = async () => {
        console.log(userAnswer);
    }

    return (
        <div className='flex flex-col'>
            <div className="w-full container mx-2 my-4 p-2 border border-gray-300 rounded-xl">
                <p className='text-3xl font-bold text-center'>{contest.taskArray[currentPage].script.title}</p>
            </div>
            <div className="w-full container mx-2 p-4 mb-4 border border-gray-300 rounded-xl">
                <div className='flex flex-row items-center'>
                    <Button 
                        isIconOnly 
                        variant='light' 
                        color='primary' 
                        className='mr-2' 
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? "Pause audio" : "Play audio"}
                    >
                        {isPlaying
                            ? <PauseIcon height="2rem" fill="#006fee"/>
                            : <PlayIcon height="2rem" fill="#006fee"/>
                        }
                    </Button>  
                    <div className='flex items-center mr-4'>
                        <span className='mr-2'>{formatTime(currentSecond)}</span> 
                        <span>/</span>
                        <span className='ml-2'>{formatTime(audioLength)}</span>
                    </div>
                    <Slider 
                        size="sm"
                        maxValue={audioLength}
                        value={currentSecond}
                        className="w-full mr-4"
                        onChange={handleSliderChange}
                        aria-label="Audio playback position"
                    />
                    <div className='mr-4'>
                        <VolumeIcon height="1.75rem" fill="#006fee"/>
                    </div>
                    <Slider 
                        size="sm"
                        maxValue={10}
                        value={currentVolume}
                        className="w-1/6 mr-4"
                        onChange={setCurrentVolume}
                        aria-label="Audio volume"
                    />
                </div>
            </div>
            
            {[0, 1].map((_, idx) => (
                <div>
                    {contest.taskArray[currentPage].exercise[idx].typeOfQuestion === "Multiple choice"
                        ? <McqQuestion contest={contest} currentPage={currentPage} idx={idx} userAnswer={userAnswer[idx]}
                            previousNumber={idx === 0 ? 0 : contest.taskArray[currentPage].exercise[0].numberOfQuestion}
                            setUserAnswer={(newAnswer: string[]) => {
                                const updatedUserAnswers = [...userAnswer];
                                updatedUserAnswers[idx] = newAnswer;
                                console.log("Updated User Answers:", updatedUserAnswers);
                                setUserAnswer(updatedUserAnswers);
                            }}
                        />
                        : null
                    }
                    {contest.taskArray[currentPage].exercise[idx].typeOfQuestion === "Short-answer questions"
                        ? <SaqQuestion contest={contest} currentPage={currentPage} idx={idx} userAnswer={userAnswer[idx]}
                            previousNumber={idx === 0 ? 0 : contest.taskArray[currentPage].exercise[0].numberOfQuestion}
                            setUserAnswer={(newAnswer: string[]) => {
                                const updatedUserAnswers = [...userAnswer];
                                updatedUserAnswers[idx] = newAnswer;
                                console.log("Updated User Answers:", updatedUserAnswers);
                                setUserAnswer(updatedUserAnswers);
                            }}
                        />
                        : null
                    }
                </div>
            ))}

            <div className='w-1/3 ml-2'>
                <Button color='success' onClick={handleSubmit}>
                    <p className='text-[1.01rem]'>Submit your answer</p>
                </Button>
            </div>

        </div>
    );
};

export default ListeningTaskContest;
