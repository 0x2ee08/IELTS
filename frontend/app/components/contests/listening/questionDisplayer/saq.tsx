'use client';

import React, { useRef } from 'react';
import { Textarea } from "@nextui-org/react";

const SaqQuestion = ({ contest, currentPage, idx, previousNumber, userAnswer, setUserAnswer }: { contest: any; currentPage: number; idx: number; previousNumber: number; userAnswer: string[]; setUserAnswer: (answer: string[]) => void; }) => {
    const hasInitialized = useRef(false);
    const numberOfQuestion = contest.taskArray[currentPage].exercise[idx].numberOfQuestion;
    const midpoint = numberOfQuestion;

    const handleTextAreaChange = (questionId: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAnswers = [...userAnswer];
        newAnswers[questionId] = e.target.value; 
        setUserAnswer(newAnswers);
    };

    return (
        <div className="w-full container mx-2 p-4 mb-4 border border-gray-300 rounded-xl flex flex-row">
            <div className='w-full'>
                {contest.taskArray[currentPage].exercise[idx].data.statement.slice(0, midpoint).map((statement: string, questionId: number) => (
                    <div key={questionId} className={`flex items-center mt-2 ${questionId === midpoint - 1 ? '' : 'mb-4'}`}>
                        <span className='font-bold mr-2'>{`Question ${previousNumber + questionId + 1}: `}</span>
                        <span className='mr-2'>{statement}</span>
                        <span style={{ width: '300px' }}>
                            <Textarea
                                variant="bordered"
                                maxRows={1}
                                fullWidth={false}
                                onChange={handleTextAreaChange(questionId)}
                            />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SaqQuestion;
