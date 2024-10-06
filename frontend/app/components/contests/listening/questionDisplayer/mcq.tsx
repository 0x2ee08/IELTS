'use client';

import React, { useRef, useState } from 'react';
import { Checkbox, Divider } from "@nextui-org/react";

const McqQuestion = ({ contest, currentPage, idx, previousNumber, userAnswer, setUserAnswer }: { contest: any; currentPage: number; idx: number; previousNumber: number; userAnswer: string[]; setUserAnswer: (answer: string[]) => void; }) => {
    const hasInitialized = useRef(false);
    const numberOfQuestion = contest.taskArray[currentPage].exercise[idx].numberOfQuestion;
    const midpoint = Math.ceil(numberOfQuestion / 2);

    const handleCheckboxChange = (questionId: number, choice: string) => {
        const newAnswers = [...userAnswer];
        newAnswers[questionId] = choice; 
        setUserAnswer(newAnswers);
    };

    return (
        <div className="w-full container mx-2 p-4 mb-4 border border-gray-300 rounded-xl flex flex-row">
            <div className='w-1/2'>
                {contest.taskArray[currentPage].exercise[idx].data.statement.slice(0, midpoint).map((statement: string, questionId: number) => (
                    <div key={questionId}>
                        <span className='font-bold'>{`Question ${previousNumber + questionId + 1}: `}</span>
                        <span>{statement}</span>
                        <div className={`mt-2 ${questionId === midpoint - 1 ? '' : 'mb-4'}`}>
                            {contest.taskArray[currentPage].exercise[idx].data.choices[questionId].split(', ').map((choice: string, choiceId: number) => (
                                <div key={choiceId}>
                                    <Checkbox
                                        isSelected={userAnswer[questionId] === choice}
                                        onChange={() => handleCheckboxChange(questionId, choice)}
                                        className='mb-1'
                                    >
                                        {choice}
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className='w-1/2'>
                {contest.taskArray[currentPage].exercise[idx].data.statement.slice(midpoint).map((statement: string, questionId: number) => (
                    <div key={questionId + midpoint}>
                        <span className='font-bold'>{`Question ${previousNumber + questionId + midpoint + 1}: `}</span>
                        <span>{statement}</span>
                        <div className={`mt-2 ${questionId + midpoint === numberOfQuestion - 1 ? '' : 'mb-4'}`}>
                            {contest.taskArray[currentPage].exercise[idx].data.choices[questionId + midpoint].split(', ').map((choice: string, choiceId: number) => (
                                <div key={choiceId}>
                                    <Checkbox
                                        isSelected={userAnswer[questionId + midpoint] === choice}
                                        onChange={() => handleCheckboxChange(questionId + midpoint, choice)}
                                        className='mb-1'
                                    >
                                        {choice}
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default McqQuestion;
