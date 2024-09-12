import React, { useState, useEffect, useRef } from 'react';
import config from '../../../../config';
import { Accordion, AccordionItem } from '@nextui-org/react';

export interface QuestionGeneral {
    type: string;
    number_of_task: string;
    length: number;
    questions: string[];
}

interface ResultPageProps {
    task: QuestionGeneral;
    problem_id: string | null;
}

interface TranscriptData {
    real_transcript: string;
    ipa_transcript: string;
    pronunciation_accuracy: string;
    real_transcripts: string;
    matched_transcripts: string;
    real_transcripts_ipa: string;
    matched_transcripts_ipa: string;
    pair_accuracy_category: string;
    start_time: number[];
    end_time: number[];
    is_letter_correct_all_words: string;
}

interface ResultItem {
    [key: string]: {
        data: TranscriptData;
        audioBlob: any;
    };
}

interface UserAnswer {
    username: string;
    result: ResultItem[];
}

const ResultPage: React.FC<ResultPageProps> = ({ problem_id, task }) => {
    const [answerArray, setAnswerArray] = useState<ResultItem[]>([]);
    const username = localStorage.getItem('username');

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getAnswers();
            hasInitialize.current = true;
        }
    }, []);

    const getAnswers = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingAnswer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problem_id }),
        });
        const result = await response.json();
        console.log('API Result:', result); // Log the result to inspect the structure
        const userAnswer = result.answer;
        if (userAnswer && Array.isArray(userAnswer.result)) {
            setAnswerArray(userAnswer.result);
        } else {
            setAnswerArray([]);
        }
    };

    return (
        <div className='mt-4'>
            <div className='w-1/2'>
                {answerArray.length > 0 ? (
                    <Accordion variant="shadow">
                        {answerArray.map((item, idx) => (
                            <AccordionItem
                                key={idx}
                                aria-label={`Accordion ${idx + 1}`}
                                title={`Submission ${idx + 1} of user ${username}`}
                            >
                                {Object.entries(item).slice(0, -1).map(([key, value]) => (
                                    <div className='flex flex-col mb-4' key={key}>
                                        <div className='mb-4'>
                                            {task.questions[parseInt(key)] || `Question ${parseInt(key) + 1}`}
                                        </div>
                                        <div>
                                            {value?.data?.matched_transcripts || 'No transcript available'}
                                        </div>
                                    </div>
                                ))}
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p>You have no past submissions.</p>
                )}
            </div>
        </div>
    );
};

export default ResultPage;
