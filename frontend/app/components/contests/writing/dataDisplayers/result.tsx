import React, { useState, useEffect, useRef, useCallback } from 'react';
import config from '../../../../config';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Card, CardHeader, CardBody, Divider, CardFooter } from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip} from "@nextui-org/react";
import FeedbackTable from './table';
import { Progress, Button } from "@nextui-org/react";


export interface QuestionGeneral {
    type: string;
    number_of_task: string;
    length: number;
    questions: string[];
}

interface ResultPageProps {
    task: QuestionGeneral;
    task_id: number;
    id: string | null;
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
    audioData: string;
}

interface ResultItem {
    [key: string]: {
        data: TranscriptData;
        audioData: string;
    };
}

interface UserAnswer {
    username: string;
    result: ResultItem[];
    time_created: string;
}

interface Band {
    pronunciation: number;
    fluency: number;
    lexical: number;
    grammar: number;
    response: number;
    total: number;
}

interface Feedback {
    pronunciation: string;
    fluency: string;
    lexical: string;
    grammar: string;
    response: string;
}

const ResultPage: React.FC<ResultPageProps> = ({ task, task_id, id }) => {
    const [answerArray, setAnswerArray] = useState<ResultItem[]>([]);
    const [choosenRecord, setRecord] = useState(-1);
    const [choosenMessage, setChoosenMessage] = useState(-1);
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
        total: 0,
    });
    const username = localStorage.getItem('username');
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';
    const [isGrading, setIsGrading] = useState(0);
    const [saveGrading, setSaveGrading] = useState(true);
    const [userAudio, setUserAudio] = useState<string[]>(() => 
        new Array(Number(task.number_of_task)).fill('')
    );

    const hasInitialize = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [messageTranscript, setMessageTranscript] = useState<TranscriptData>();

    useEffect(() => {
        if (!hasInitialize.current) {
            setSaveGrading(true);
            hasInitialize.current = true;
        }
    }, []);

    useEffect(() => {
        getAnswers();
        setBand(prevBand => ({
            ...prevBand,
            lexical: extractBandNumber(feedback.lexical),
            grammar: extractBandNumber(feedback.grammar),
        }));
    }, [feedback.lexical, feedback.grammar]);

    const getAnswers = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingAnswer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
        });
        const result = await response.json();
        const userAnswer = result.answer;
        console.log(userAnswer)
        if (userAnswer && Array.isArray(userAnswer.result)) {
            setAnswerArray([]);
            for (let i = userAnswer.result.length - 1; i>=0 ; i--) {
                if (userAnswer.result[i].task_id === task_id)
                    setAnswerArray(prevAnswerArray => [...prevAnswerArray, userAnswer.result[i]]);
            }
        } else {
            setAnswerArray([]);
        }
    };

    const playSpeechFromWord = async (text: string) => {
        let audioBase64 = "";
        await fetch(`${config.API_PRONOUNCE_BASE_URL}/getAudioFromText`, {
            method: "post",
            body: JSON.stringify({ "text": text }),
            headers: { "X-Api-Key": STScoreAPIKey }
        }).then(res => res.json())
            .then(data => {
                audioBase64 = data['audioBase64']
            });
        const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        const arrayBuffer = audioData.buffer;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => {
            console.log('Playback finished');
        };
    };

    const getAudio = async (idx: number, audioUrl: string) => {
        let audioBase64 = ""
        await fetch(`${config.API_PRONOUNCE_BASE_URL}getAudioFromDrive`, {
            method: "post",
            body: JSON.stringify({ url: audioUrl }),
            headers: { "X-Api-Key": STScoreAPIKey }
        }).then(res => res.json())
            .then(data => {
                audioBase64 = data['audioBase64']
            });
        userAudio[idx] = audioBase64;
    }

    const replayAudio = async (key: number, startTime: number, endTime: number) => {
        try {
            let audioBase64 = userAudio[key];

            const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
            const arrayBuffer = audioData.buffer;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            const startOffset = startTime;
            const endOffset = endTime - startTime;
            source.start(0, startOffset, endOffset);
            source.onended = () => {
                console.log('Playback finished');
            };
        } catch (error) {
            console.error('Error downloading audio:', error);
        }
    };

    const handleClickOnWord = (idx: number, key: number, start_time: any, end_time: any, shouldGetAudio: boolean) => {
        if(shouldGetAudio) {
            replayAudio(key, start_time, end_time);
        }
        else {
            handleChooseMessage(idx, key);
        }
    }

    const getColoredMatchedTranscript = (
                    idx: number,
                    key: number,
                    matchedTranscript: string,
                    is_letter_correct_all_words: string,
                    real_transcripts_ipa: string,
                    real_start_time: number[],
                    real_end_time: number[],
                    audioData: string,
                    shouldGetAudio: boolean,) => {
        const currentTextWords = matchedTranscript.split(' ');
        const lettersOfWordAreCorrect = is_letter_correct_all_words.split(' ');
        const realTranscript = real_transcripts_ipa.split(' ');
        const start_time = real_start_time;
        let end_time = real_end_time;
        let coloredWords = [];

        console.log(key, audioData);
        if(shouldGetAudio) {
            console.log(key, audioData);
            getAudio(key, audioData);
        }

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
                        onClick={() => handleClickOnWord(idx, key, start_time[word_idx], end_time[word_idx], shouldGetAudio)}
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

    const handleChooseMessage = async (idx: number, key: any) => {
        setRecord(idx);
        setChoosenMessage(Number(key));
        setMessageTranscript({
            ...answerArray[idx][key].data,
            audioData: answerArray[idx][key].audioData
        });        
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
        const rband = result.band;
        const n = rband.length;
        if(rband[n - idx - 1][key].band) {
            setBand(rband[n - idx - 1][key].band);
            setFeedback(rband[n - idx - 1][key].feedback)
            setIsGrading(0);
            setSaveGrading(true);
            return;
        }

        setSaveGrading(true);
        setIsGrading(1);
        feedback.pronunciation = answerArray[idx][key].data.is_letter_correct_all_words;
        feedback.fluency = "none"
        console.log(answerArray[idx][key].data.pronunciation_accuracy);
        band.pronunciation = convertToIELTSBand(100, Number(answerArray[idx][key].data.pronunciation_accuracy));
        console.log(band.pronunciation);
        band.fluency = convertToIELTSBand(1, calculateFluency(answerArray[idx][key]));
        getSpeakingLexicalResource(task.questions[Number(key)], answerArray[idx][key].data.matched_transcripts)
            .then(content => setFeedback(prevFeedback => ({ ...prevFeedback, lexical: content })))
            .catch(error => console.error('Error fetching lexical resource:', error));
        getSpeakingGrammar(task.questions[Number(key)], answerArray[idx][key].data.matched_transcripts)
            .then(content => setFeedback(prevFeedback => ({ ...prevFeedback, grammar: content })))
            .catch(error => console.error('Error fetching grammar:', error));
        band.lexical = extractBandNumber(feedback.lexical);
        band.grammar = extractBandNumber(feedback.grammar);

        console.log(band);
    };   

    const extractBandNumber = (input: string): number => {
        const bandRegex = /\[BAND\]:\s*(\d+(\.\d+)?)/;
        const match = bandRegex.exec(input);
        return match ? parseFloat(match[1]) : 0;
    };

    const convertToIELTSBand = (maxScore: number, score: number) => {
        const d = maxScore / 9;
        if(d === 0) return 0;
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
        return Math.min(Math.max(band, 1), 9);
    }

    const calculateFluency = (detailResult: any): number => {
        const transcriptWords: string[] = detailResult.data.real_transcript.trim().split(' ');
        const totalWords: number = transcriptWords.length;
        const audioLength: number = detailResult.data.end_time[detailResult.data.end_time.length - 1] - detailResult.data.start_time[0];
        const SR: number = totalWords / audioLength;
        const SRmin: number = Math.min(...transcriptWords.map((_, i) => (transcriptWords[i + 1] ? 1 / (detailResult.data.end_time[i] - detailResult.data.start_time[i]) : 0)));
        const SRmax: number = Math.max(...transcriptWords.map((_, i) => (transcriptWords[i + 1] ? 1 / (detailResult.data.end_time[i] - detailResult.data.start_time[i]) : 0)));
        const SRnorm: number = (SR - SRmin) / (SRmax - SRmin);

        const pauses: number[] = detailResult.data.start_time.map((_: number, i: number) =>
            (detailResult.data.start_time[i + 1] || 0) - (detailResult.data.end_time[i] || 0)
        );
    
        const APW: number = pauses.reduce((acc: number, pause: number) => acc + pause, 0) / pauses.length;
    
        const APWmin: number = Math.min(...pauses);
        const APWmax: number = Math.max(...pauses);
        const APWnorm: number = 1 - (APW - APWmin) / (APWmax - APWmin);
    
        const APS: number = 2.0; 
        const APSnorm: number = (3.0 - APS) / (3.0 - 1.5); 
    
        const fillerWords: string[] = ["um", "uh", "like"]; 
        const FWC: number = transcriptWords.filter((word: string) => fillerWords.includes(word)).length;
    
        const pauseDurations: number[] = pauses.filter((pause: number) => pause > 0);
        const meanPause: number = pauseDurations.reduce((acc: number, pause: number) => acc + pause, 0) / pauseDurations.length;
        const stdDevPause: number = Math.sqrt(pauseDurations.reduce((acc: number, pause: number) => acc + Math.pow(pause - meanPause, 2), 0) / pauseDurations.length);
    
        const threshold: number = meanPause + 1 * stdDevPause;  
        const PPH: number = pauses.filter((pause: number) => pause > threshold).length;  
    
        const HFmin: number = 0;  
        const HFmax: number = Math.max(FWC + PPH, 20);
        const HF: number = FWC + PPH;
        const HFnorm: number = 1 - (HF - HFmin) / (HFmax - HFmin);
    
        let R: number = 0;
        for (let i: number = 0; i < transcriptWords.length - 1; i++) {
            if (transcriptWords[i] === transcriptWords[i + 1]) {
                R++; 
            }
        }
    
        const Rmin: number = 0;  
        const Rmax: number = Math.max(R, 10);  
        const Rnorm: number = 1 - (R - Rmin) / (Rmax - Rmin);

        const fluency: number = (0.25 * SRnorm) + (0.20 * APWnorm) + (0.15 * APSnorm) + (0.25 * HFnorm) + (0.15 * Rnorm);
        // console.log(fluency, fluency*9.0);
        return fluency;
    };
    

    const getSpeakingLexicalResource = async(question: string, answer: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingLexicalResource`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ question, answer }),
        });
        const result = await response.json();
        return result.content;
    }

    const getSpeakingGrammar = async(question: string, answer: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getSpeakingGrammar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ question, answer }),
        });
        const result = await response.json();
        setIsGrading(0);
        setSaveGrading(false);
        return result.content;
    }

    const addSpeakingGrading = async() => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/addSpeakingGrading`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, task_id, choosenRecord, choosenMessage, band, feedback }),
        });
        const result = await response.json();
        setSaveGrading(true);
    }

    return (
        <div className='flex'>
            <div className='w-1/2 mr-4'>
                {answerArray.length > 0 ? (
                    <Accordion variant='bordered'>
                        {answerArray.map((item, idx) => (
                            <AccordionItem
                                key={idx}
                                aria-label={`Accordion ${idx + 1}`}
                                title={
                                    <div style={{ fontSize: '1rem' }}>
                                        <span>
                                            Submission {idx + 1} of user 
                                            <strong> {username} </strong> 
                                            at {new Date(item.time_created.toString()).toLocaleString()}
                                        </span>
                                    </div>
                                }
                            >
                                <div className=''></div>
                                {Object.entries(item).slice(0, -2).map(([key, value]) => (
                                    <div className='flex-col' key={key}>
                                        <Divider/>
                                        <div className='flex justify-start mb-2 mt-2'>
                                            <div className='text-left max-w-2/3 mr-2'>
                                                {task.questions[parseInt(key)] || `Question ${parseInt(key) + 1}`}
                                            </div>
                                            <div
                                                onClick={(e) => handleChooseMessage(idx, key)}
                                                style={{color: '#006fee', textDecoration: 'underline',cursor: 'pointer',}}
                                                className='text-left max-w-2/3'
                                            >
                                                Detail
                                            </div>
                                        </div>
                                        <div className='flex justify-end mb-6'>
                                            <div className='text-right' style={{ maxWidth: '90%' }}>
                                                <div style={{display: 'inline-block'}}>
                                                    {getColoredMatchedTranscript(
                                                        idx,
                                                        parseInt(key),
                                                        value?.data?.matched_transcripts,
                                                        value?.data?.is_letter_correct_all_words,
                                                        value?.data?.real_transcripts_ipa,
                                                        value?.data?.start_time,
                                                        value?.data?.end_time,
                                                        value?.audioData,
                                                        false,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    null
                )}
            </div>
            <div className='w-1/2'>
                {choosenMessage !== -1 ? (
                    <div className='border-2 border-[#dcdcdc] px-4 py-4 rounded-xl mb-2'>
                        {isGrading === 0 ? (
                            <div>
                                <div className='mb-6'>
                                    {messageTranscript && getColoredMatchedTranscript(
                                        choosenRecord,
                                        choosenMessage,
                                        messageTranscript.matched_transcripts,
                                        messageTranscript.is_letter_correct_all_words,
                                        messageTranscript.real_transcripts_ipa,
                                        messageTranscript.start_time,
                                        messageTranscript.end_time,
                                        messageTranscript.audioData,
                                        true,
                                    )}
                                </div>
                                <FeedbackTable feedback={feedback} band={band}/>
                            </div>
                        ) : (
                            <Progress size="sm" isIndeterminate aria-label="Loading..." className="max-w mb-4"/>
                        )}
                        {/* <p><strong>Pronunciation: </strong>{feedback.pronunciation}</p>
                        <p><strong>Fluency: </strong>{feedback.fluency}</p>
                        <p><strong>Lexical resource: </strong>{feedback.lexical}</p>
                        <p><strong>Grammar: </strong>{feedback.grammar}</p> */}
                        {!saveGrading ? (
                            <Button 
                                onClick={addSpeakingGrading}
                                color="primary"
                                style={{ fontSize: '1rem' }}
                            >
                                Save your result
                            </Button>
                        ) : (
                            null
                        )}
                        
                    </div>
                ) : (
                    null
                )}
            </div>
        </div>
    );
};

export default ResultPage;
