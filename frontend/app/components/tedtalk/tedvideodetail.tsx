'use client';
import React, { useState, useCallback, useRef, useEffect, use } from 'react';
import YouTube from 'react-youtube';
import "./styles.css";
import config from '../../config';
import axios from 'axios';
import { useSearchParams } from "next/navigation";
import { convertDuration } from './convertDuration';
import { formatDistanceToNow, parseISO } from 'date-fns';
import eyeIcon from './eye_icon.png';
import heartIcon from './heart_icon.png';
import Draggable from 'react-draggable';
import { prompt1, prompt2, prompt3 } from './template_quiz';
import { decode } from 'punycode';
const convertSecondsToReadable = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let formattedTime = '';
    if (hours > 0) formattedTime += `${hours}h`;
    if (minutes > 0) formattedTime += `${minutes}m`;
    formattedTime += `${secs}s`;

    return formattedTime;
};

const decodeHtmlEntities = (text: string): string => {
    const entities: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'"
    };

    return text.replace(/&[#A-Za-z0-9]+;/g, (entity) => entities[entity] || entity);
};



const TedVideoDetail: React.FC = () => {
    const params = useSearchParams();
    const [notes, setNotes] = useState<string>('');
    const [message, setMessage] = useState<string>('')
    const [savedNotes, setSavedNotes] = useState<string>('')
    const [messages, setMessages] = useState<{ user: boolean, text: string }[]>([
        { user: false, text: 'Ask me anything! I can summarize, explain content, translate words, ...' },
    ]);

    const [highlightedWord, setHighlightedWord] = useState<{
        word: string,
        pronunciation: string,
        type: string,
        meaning: string
    } | null>(null);
    const [doubleClickPosition, setDoubleClickPosition] = useState<{ top: number; left: number } | null>(null);
    const handleDoubleClick = async () => {
        const selection = window.getSelection();
        const word = selection?.toString().trim();

        if (word) {
            // Get the range of the selected word
            const range = selection?.getRangeAt(0).getBoundingClientRect();

            if (range) {
                setDoubleClickPosition({
                    top: range.bottom + window.scrollY, // Position below the word
                    left: range.left + window.scrollX,  // Align with the word's start
                });
                // Fetch data from the dictionary API
                try {
                    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
                    const data = await response.json();

                    if (data[0]) {
                        const wordInfo = {
                            word,
                            pronunciation: data[0].phonetics[0]?.text || "No pronunciation available",
                            type: data[0].meanings[0]?.partOfSpeech || "No type available",
                            meaning: data[0].meanings[0]?.definitions[0]?.definition || "No meaning available",
                        };

                        setHighlightedWord(wordInfo);
                    } else {
                        setHighlightedWord({
                            word,
                            pronunciation: "No pronunciation available",
                            type: "No type available",
                            meaning: "No meaning available",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching word data:", error);
                    setHighlightedWord({
                        word,
                        pronunciation: "No pronunciation available",
                        type: "No type available",
                        meaning: "No meaning available",
                    });
                }
            }
        } else {
            // Clear both the highlighted word and position if no word is selected
            setHighlightedWord(null);
            setDoubleClickPosition(null);
        }
    };
    // Handle when the user clicks anywhere else to remove the box
    const handleClickOutside = () => {
        setHighlightedWord(null);
        setDoubleClickPosition(null);
    };
    // Add event listener to detect clicks outside the selection
    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const parentContainer = messagesEndRef.current?.parentElement;
        if (parentContainer) {
            parentContainer.scrollTop = parentContainer.scrollHeight;
        }
    }, [messages]);

    const videoId = params.get("id") || '';
    const [video, setVideo] = useState({
        title: "",
        thumbnail: "",
        publishDate: "",
        channelId: "",
        duration: "",
        views: "",
        likes: "",
    });
    const [dateString, setDateString] = useState('');
    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [transcript, setTranscript] = useState<any[]>([]);
    const [isTranscriptVisible, setIsTranscriptVisible] = useState<boolean>(true);
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [sendingChat, setSendingChat] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 100, left: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isNoteVisible, setNoteVisible] = useState<boolean>(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [revealAnswers, setRevealAnswers] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.left, y: e.clientY - position.top });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const newLeft = e.clientX - dragStart.x;
        const newTop = e.clientY - dragStart.y;
        setPosition({ top: newTop, left: newLeft });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleNoteVisible = () => {
        setNoteVisible(!isNoteVisible);
    };

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, position]);

    const getVideo = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_ted_video_by_id`, { videoId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setVideo(response.data.video || []);
            const date = parseISO(response.data.video.publishDate.toString());
            setDateString(formatDistanceToNow(date, { addSuffix: true }));


        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const fetch_transcript = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_transcript`, { videoId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data;
            const decodedTranscript = result.transcript.map((item: any) => ({
                ...item,
                text: decodeHtmlEntities(item.text),
            }));
            setTranscript(decodedTranscript);

        } catch (error) {
            console.error('Error fetching transcript:', error);
            alert('Internal server error');
        }
    };

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getVideo();
            fetch_transcript();
            handleGetNote(videoId);
            hasInitialize.current = true;
        }
    }, []);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [currentTime, transcript]);

    const onReady = useCallback((event: { target: YT.Player }) => {
        setPlayer(event.target);
    }, []);

    const onStateChange = useCallback((event: { data: number }) => {
        if (event.data === YT.PlayerState.PLAYING) {
            const interval = setInterval(() => {
                if (player) {
                    setCurrentTime(player.getCurrentTime());
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [player]);

    const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        const token = localStorage.getItem('token');
        const content = e.target.value;

        try {
            const response = await axios.post(`${config.API_BASE_URL}api/save_note`, { videoId, content }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200 && response.data.success) {
                // alert('Note saved!');
            } else {
                // alert('Failed to save note');
            }
        } catch (error) {
            // setMessage('Failed to save note due to a network error.');
        }
    };

    const handleGetNote = async (video_id: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_note`, { video_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data;
            setNotes(result.content);
        } catch (error) {
            console.error('An error occurred while fetching the note:', error);
            setMessage('An error occurred while fetching the note');
            setSavedNotes('');
        }
    };

    const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setSendingChat(true);
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement;
        const token = localStorage.getItem('token');

        const newMessage = { role: 'user', content: input.value.trim() + " (Limit your response to 50 words.)" };
        const formattedMessages = [
            ...messages.map(msg => ({
                role: msg.user ? 'user' : 'assistant',
                content: msg.text
            })),
            newMessage
        ];

        axios.post(`${config.API_BASE_URL}api/send_chat`,
            { message: formattedMessages },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
            .then(response => {
                setMessages([...messages,
                { user: true, text: input.value.trim() },
                { user: false, text: response.data.message }
                ]);
                input.value = '';
            })
            .catch(error => alert('Send Chat Error'))
            .finally(() => {
                setSendingChat(false);
            });
    };

    type Question = {
        question: string;
        answers: {
            [key: string]: string;
        };
        correctAnswer: string;
    };

    const validateQuestions = (questions: Question[]): boolean => {
        if (questions.length < 5 || questions.length > 10) {
            return false;
        }

        return questions.every(question => {
            const answers = Object.values(question.answers);
            const correctAnswerKey = question.correctAnswer.split(".")[0];

            return answers.length === 4 &&
                answers.every(answer => answer && answer.trim() !== '') &&
                question.correctAnswer &&
                question.answers[correctAnswerKey];
        });
    };

    const parseQuestionsAndAnswers = (text: string): Question[] => {
        // Regex to match each question block
        const questionBlockRegex = /\*\*Question \d+:\*\*[^*]*(?=\*\*Question \d+:|$)/g;
        // Regex to match answers within a question block
        const answerRegex = /([A-D])\.\s([^\n]+)/g;
        // Regex to match the correct answer with the answer text
        const correctAnswerRegex = /Correct answer: ([A-D])\.\s([^\n]+)/;

        const questions: Question[] = [];

        // Find all question blocks
        const questionBlocks = text.match(questionBlockRegex) || [];

        questionBlocks.forEach(block => {
            // Extract the question text
            const questionTextMatch = block.match(/^\*\*Question \d+:\*\*\s*([\s\S]*?)(?=\n[A-D]\.)/);
            const questionText = questionTextMatch ? questionTextMatch[1].trim() : '';

            // Extract answers
            const answers: { [key: string]: string } = {};
            let answerMatch;
            while ((answerMatch = answerRegex.exec(block)) !== null) {
                const key = answerMatch[1];
                const answer = answerMatch[2].trim();
                answers[key] = answer;
            }

            // Extract the correct answer
            const correctAnswerMatch = correctAnswerRegex.exec(block);
            const correctAnswerKey = correctAnswerMatch ? correctAnswerMatch[1] : '';
            const correctAnswerText = correctAnswerMatch ? correctAnswerMatch[2].trim() : '';
            let correctAnswer!: string;

            // Shuffle
            for (var i = 0; i <= 3; i++) {
                const pos1 = String.fromCharCode(i + 65);
                const pos2 = String.fromCharCode(Math.floor(Math.random() * (4 - i)) + i + 65);
                [answers[pos1], answers[pos2]] = [answers[pos2], answers[pos1]];
            }
            for (var i = 0; i <= 3; i++) {
                if (answers[String.fromCharCode(i + 65)] == correctAnswerText) {
                    correctAnswer = String.fromCharCode(i + 65) + `. ${correctAnswerText}`;
                    break;
                }
            }

            // Push the question object to the questions array
            questions.push({
                question: questionText,
                answers,
                correctAnswer
            });
        });

        return questions;
    };

    const handleQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        var fulltranscript = "";
        for (var i = 0; i < transcript.length; i++) {
            fulltranscript += transcript[i].text;
            fulltranscript += " ";
        }
        var reworked = decodeHtmlEntities(fulltranscript);
        var getNum = Math.floor(Math.random() * 6) + 5;
        reworked = prompt1 + reworked + prompt2 + getNum.toString() + prompt3;
        const newMessage = {
            role: 'user',
            content: reworked
        };
        const formattedMessages = [
            newMessage
        ];
        axios.post(`${config.API_BASE_URL}api/create_quiz`,
            { message: formattedMessages },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
            .then(async response => {
                // console.warn(response.data.message);
                const arr = parseQuestionsAndAnswers(response.data.message);
                // for (var i = 0; i < arr.length; i++) {
                //     console.log("fuck");
                //     console.warn(arr[i].question);
                //     console.warn(arr[i].answers);
                //     console.warn(arr[i].correctAnswer);
                // }
                setQuestions(arr);
                setSelectedAnswers({});
                setRevealAnswers(false);

                if (validateQuestions(arr) == true) {
                    try {
                        const response = await axios.post(`${config.API_BASE_URL}api/save_quiz`, { videoId, arr}, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
            
                        if (response.status === 200 && response.data.success) {
                            // alert('Quiz saved!');
                        } else {
                            // alert('Failed to save quiz');
                        }
                    } catch (error) {
                        // setMessage('Failed to save quiz due to a network error.');
                    }
                }
            })
            .catch(errorq => alert('Create Quiz Error'))
            .finally(() => {
                setLoading(false);
            });
    };

    const handleAnswerChange = (questionIndex: number, answerKey: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answerKey }));
    };

    const handleRevealAnswers = () => {
        setRevealAnswers(true);
    };

    const resetQuiz = () => {
        setQuestions([]);
        setSelectedAnswers({});
        setRevealAnswers(false);
    };

    const checkAllQuestionsAnswered = () => {
        return questions.length > 0 && questions.every((_, index) => selectedAnswers[index] !== undefined);
    };

    const getCorrectAnswerKey = (correctAnswer: string): string => {
        return correctAnswer.split('.')[0]; // Extracts just the key from "A. Some answer"
    };

    const opts = {
        height: '426px',
        width: '100%',
        playerVars: {
            autoplay: 1,
        },
    };

    const filteredTranscript = transcript.filter(item => currentTime >= item.offset);

    const toggleTranscriptVisibility = () => {
        setIsTranscriptVisible(!isTranscriptVisible);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-8 px-8 lg:px-12 py-8">
                {/* Left Column: 2/3 Width */}
                <div className="lg:w-2/3 space-y-8">
                    {/* Left Column */}
                    <div style={{ display: 'grid', gridGap: '10px', height: 'auto' }}>
                        {/* Video Player */}
                        <YouTube
                            videoId={videoId}
                            opts={opts}
                            onReady={onReady}
                            onStateChange={onStateChange}
                            style={{
                                borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'

                            }}
                        />
                        <strong style={{ fontSize: '20px' }}> {video.title}</strong>

                        {/* Video Description */}
                        <div style={{ padding: '10px', backgroundColor: '#ffff', borderRadius: '10px', boxShadow: '4px 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span style={{ color: '#888' }}>Thời lượng: {convertDuration(video.duration)} | {dateString}</span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#009bdb' }}>
                                        <img src={eyeIcon.src} alt="Views" style={{ width: '20px', height: '20px', marginRight: '5px' }} /> {video.views}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#009bdb' }}>
                                        <img src={heartIcon.src} alt="Likes" style={{ width: '20px', height: '20px', marginRight: '5px' }} /> {video.likes}
                                    </span>
                                    <span>
                                        {!isNoteVisible &&
                                            <div className="flex justify-start">
                                                <button
                                                    style={{
                                                        color: '#0077b6'
                                                    }}
                                                    onClick={handleNoteVisible}>
                                                    Note
                                                </button>
                                            </div>
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quiz */}
                        <div>
                            {/* Form to generate questions */}
                            {!questions.length && (
                                <form onSubmit={handleQuiz}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            backgroundColor: '#0077b6',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            display: loading ? 'none' : 'block',
                                        }}
                                    >
                                        Generate Questions
                                    </button>
                                </form>
                            )}

                            {/* Render questions if available and valid */}
                            {questions.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    {/* Check if the questions are valid */}
                                    {validateQuestions(questions) ? (
                                        <>
                                            {questions.map((q, questionIndex) => (
                                                <div key={questionIndex} style={{ marginBottom: '20px' }}>
                                                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                                        {questionIndex + 1}. {q.question}
                                                    </p>
                                                    <div>
                                                        {Object.entries(q.answers).map(([key, answer]) => (
                                                            <div
                                                                key={key}
                                                                onClick={() => !revealAnswers && handleAnswerChange(questionIndex, key)}
                                                                style={{
                                                                    cursor: !revealAnswers ? 'pointer' : 'default',
                                                                    backgroundColor: selectedAnswers[questionIndex] === key
                                                                        ? revealAnswers && getCorrectAnswerKey(q.correctAnswer) === key
                                                                            ? 'lightgreen'
                                                                            : revealAnswers && selectedAnswers[questionIndex] !== key
                                                                                ? 'lightcoral'
                                                                                : 'lightgrey'
                                                                        : 'white',
                                                                    padding: '10px',
                                                                    margin: '5px 0',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #ddd',
                                                                    transition: 'background-color 0.3s ease',
                                                                }}
                                                            >
                                                                {key}. {answer}
                                                                {revealAnswers && (
                                                                    <span style={{ float: 'right', fontSize: '18px' }}>
                                                                        {selectedAnswers[questionIndex] === key && selectedAnswers[questionIndex] === getCorrectAnswerKey(q.correctAnswer) ? '✔️' : ''}
                                                                        {selectedAnswers[questionIndex] === key && selectedAnswers[questionIndex] !== getCorrectAnswerKey(q.correctAnswer) ? '❌' : ''}
                                                                        {selectedAnswers[questionIndex] !== key && getCorrectAnswerKey(q.correctAnswer) === key ? '✔️' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Reveal Answers Button */}
                                            <button
                                                onClick={handleRevealAnswers}
                                                disabled={revealAnswers}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '5px',
                                                    backgroundColor: revealAnswers ? '#d3d3d3' : '#0077b6',
                                                    color: '#fff',
                                                    border: 'none',
                                                    cursor: revealAnswers ? 'not-allowed' : 'pointer',
                                                    fontSize: '16px',
                                                    marginTop: '20px',
                                                }}
                                            >
                                                Reveal Answers
                                            </button>
                                        </>
                                    ) : (
                                        /* Show error and disable interaction if questions are invalid */
                                        <>
                                            <p style={{ color: 'red', fontSize: '18px', marginBottom: '20px' }}>
                                                The generated questions are invalid. Please try again by resetting the quiz.
                                            </p>
                                        </>
                                    )}

                                    {/* Reset Quiz Button */}
                                    <button
                                        onClick={resetQuiz}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            backgroundColor: '#ff4c4c',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        Reset Quiz
                                    </button>
                                </div>
                            )}

                            {/* Loading and Error handling */}
                            {loading && <p>Loading...</p>}
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                        </div>

                        {/* Personal Notes */}
                        {isNoteVisible &&
                            <div
                                className="window"
                                ref={windowRef}
                                style={{ top: position.top, left: position.left }}
                            >
                                <div
                                    className="toolbar"
                                    onMouseDown={handleMouseDown}
                                    style={{ borderBottom: '1px solid #d9d9d9' }}
                                >
                                    <button style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#0077b6',
                                        border: 'none',
                                        borderRadius: '12px',
                                        marginRight: '4px'
                                    }}
                                        onClick={handleNoteVisible}>
                                    </button>
                                    <span> New Note </span>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={handleNoteChange}
                                    style={{
                                        border: 'none',
                                        padding: '10px',
                                        width: '100%',
                                        height: 'calc(100% - 40px)',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        backgroundColor: 'transparent',
                                    }}
                                ></textarea>
                            </div>
                        }
                    </div>
                </div>
                {/* Right Column: 1/3 Width */}
                <div className="lg:w-1/3 space-y-8">
                    {/* Right Column */}
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 0.675fr', gridGap: '20px' }}>
                        {/* Transcript */}
                        <div style={{
                            height: '426px',
                            width: '100%',
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #d9d9d9',
                        }}>
                            <h1 style={{
                                fontWeight: 'bold',
                                textAlign: 'center' as const,
                                color: '#0077b6',
                                fontSize: '24px',
                                margin: '0',
                            }}>TRANSCRIPT</h1>
                            <button onClick={toggleTranscriptVisibility} className="toggle-button text-blue-500 hover:underline">
                                {isTranscriptVisible ? "Hide Transcript" : "Show Transcript"}
                            </button>
                            <div className="border-b border-blue-500 mt-2"></div>
                            <div
                                onDoubleClick={handleDoubleClick}
                                ref={transcriptRef}
                                style={{
                                    color: '#555',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    maxHeight: '326px',
                                    overflowY: 'auto',
                                }}
                            >
                                {filteredTranscript.map((item, index) => (
                                    <div key={index}>
                                        {isTranscriptVisible ? (
                                            <p>
                                                <strong>
                                                    {convertSecondsToReadable(Math.floor(item.offset))}:{' '}
                                                </strong>
                                                {decodeHtmlEntities(item.text)}
                                            </p>
                                        ) : (
                                            <p style={{ margin: 0 }}>
                                                <strong>
                                                    {convertSecondsToReadable(Math.floor(item.offset))}:{' '}
                                                </strong>
                                                {'.'.repeat(item.text.length)}
                                            </p>
                                        )}

                                    </div>
                                ))}
                            </div>
                            {highlightedWord && doubleClickPosition && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: doubleClickPosition.top,
                                        left: doubleClickPosition.left - 10,
                                        backgroundColor: '#009bdb',
                                        color: 'white',
                                        padding: '5px',
                                        borderRadius: '4px',
                                    }}
                                >
                                    <p>{highlightedWord.pronunciation}</p>
                                    <p>{highlightedWord.type}</p>
                                    <p>{highlightedWord.meaning}</p>
                                </div>
                            )}
                        </div>

                        {/* Chat Bot */}
                        <div style={{ backgroundColor: '#0077B6', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', width: '100%', height: '320px' }}>
                            <h3 style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF' }}>AI chat bot</h3>
                            <div style={{ padding: '10px', backgroundColor: '#FFFFFF', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', width: '100%', height: '300px', overflow: 'hidden' }}>
                                <div style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '10px', paddingRight: '10px', wordWrap: 'break-word' }}>
                                    {messages.map((message, index) => (
                                        <div key={index} style={{ textAlign: message.user ? 'right' : 'left', marginBottom: '10px' }}>
                                            <div
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    background: message.user ? '#E5E5E5' : '#5B99C2',
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    wordWrap: 'break-word',
                                                    color: message.user ? '#000000' : '#FFFFFF',
                                                }}
                                            >
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={handleChatSubmit} style={{ display: 'flex' }}>
                                    <input type="text" name="chatInput" placeholder="Type a message..." style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }} />
                                    <button type="submit" style={{
                                        padding: '8px 16px', marginLeft: '10px', borderRadius: '10px', backgroundColor: '#009bdb', color: '#fff', border: 'none',
                                        cursor: sendingChat ? 'not-allowed' : 'pointer'
                                    }}
                                        disabled={sendingChat}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TedVideoDetail;