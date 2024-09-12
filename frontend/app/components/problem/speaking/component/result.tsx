import React, { useState, useEffect, useRef } from 'react';
import config from '../../../../config';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";

export interface QuestionGeneral {
    type: string;
    number_of_task: string;
    length: number;
    questions: string[];
}

interface ResultPageProps {
    task: QuestionGeneral;
    task_id: number;
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
        audioBlob: Blob;
    };
}

interface UserAnswer {
    username: string;
    result: ResultItem[];
}

const ResultPage: React.FC<ResultPageProps> = ({ task, task_id, problem_id }) => {
    const [answerArray, setAnswerArray] = useState<ResultItem[]>([]);
    const username = localStorage.getItem('username');
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';

    const hasInitialize = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
        const userAnswer = result.answer;
        if (userAnswer && Array.isArray(userAnswer.result)) {
            setAnswerArray([]);
            for (let i = 0; i < userAnswer.result.length; i++) {
                if (userAnswer.result[i].task_id === task_id)
                    setAnswerArray(prevAnswerArray => [...prevAnswerArray, userAnswer.result[i]]);
            }
        } else {
            setAnswerArray([]);
        }
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

    const replayAudio = (audioBlob: Blob, startTime: number, endTime: number) => {

        if (!(audioBlob instanceof Blob)) {
            console.log(audioBlob)
            console.log('Invalid audioBlob: Not a Blob object');
            return;
        }
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);

        // Ensure startTime and endTime are finite numbers
        const start = Number(startTime);
        const end = Number(endTime);

        // Ensure start and end are finite numbers and round to 4 decimal places
        const roundedStartTime = parseFloat(start.toFixed(4));
        const roundedEndTime = parseFloat(end.toFixed(4));

        if (roundedEndTime > roundedStartTime) {
            audio.currentTime = roundedStartTime;
            audio.play()
                .then(() => {
                    console.log('Audio is playing');
                    const durationInSeconds = roundedEndTime - roundedStartTime;
                    const durationInMs = Math.round(durationInSeconds * 1000);

                    setTimeout(() => {
                        audio.pause();
                        URL.revokeObjectURL(audioURL);
                    }, durationInMs);
                })
                .catch((error) => console.error('Error playing audio:', error));
        } else {
            console.error('Invalid playback range: endTime must be greater than startTime.');
        }
    };

    const getColoredMatchedTranscript = (
                    matchedTranscript: string,
                    is_letter_correct_all_words: string,
                    real_transcripts_ipa: string,
                    real_start_time: number[],
                    real_end_time: number[],
                    audioBlob: Blob,) => {
        const currentTextWords = matchedTranscript.split(' ');
        const lettersOfWordAreCorrect = is_letter_correct_all_words.split(' ');
        const realTranscript = real_transcripts_ipa.split(' ');
        const start_time = real_start_time;
        let end_time = real_end_time;
        let coloredWords = [];

        for (let word_idx = 0; word_idx < currentTextWords.length; word_idx++) {
            const currentWord = currentTextWords[word_idx];
            let wordTemp = [];

            for (let letter_idx = 0; letter_idx < currentWord.length; letter_idx++) {
                const letter_is_correct = lettersOfWordAreCorrect[word_idx][letter_idx] === '1';
                const color_letter = letter_is_correct ? 'green' : 'red';
                wordTemp.push(
                    <span key={`${word_idx}-${letter_idx}`} style={{ color: color_letter }}>
                        {currentWord[letter_idx]}
                    </span>
                );
            }

            coloredWords.push(
                <div
                    key={`word-container-${word_idx}`}
                    style={{
                        display: 'inline-block',
                        textAlign: 'center',
                        marginRight: '10px',
                    }}
                >
                    <span
                        onClick={() => replayAudio(audioBlob, start_time[word_idx], end_time[word_idx])}
                        style={{ cursor: 'pointer', display: 'block' }}
                    >
                        {wordTemp}
                    </span>

                    <span
                        onClick={() => {
                            playSpeechFromWord(currentTextWords[word_idx]);
                        }}
                        style={{ cursor: 'pointer', display: 'block', color: 'gray' }}
                    >
                        {realTranscript[word_idx]}
                    </span>

                </div>
            );
        }

        return coloredWords;
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
                                {Object.entries(item).slice(0, -2).map(([key, value]) => (
                                    <div className='flex-col mb-4' key={key}>
                                        <div className='text-left'>
                                            {task.questions[parseInt(key)] || `Question ${parseInt(key) + 1}`}
                                        </div>
                                        <div className='text-right'>
                                            {/* {value?.data?.matched_transcripts || 'No transcript available'} */}
                                            {getColoredMatchedTranscript(
                                                value?.data?.matched_transcripts,
                                                value?.data?.is_letter_correct_all_words,
                                                value?.data?.real_transcripts_ipa,
                                                value?.data?.start_time,
                                                value?.data?.end_time,
                                                value?.audioBlob,
                                            )}
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
