'use client'

import React, { useEffect, useState, useRef, useReducer } from 'react';
import axios from 'axios';
import config from '../../config';

const SpeakingDetail: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<any>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb';

    const startRecording = async () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingError(null);
        setResponseData(null);
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

                const audioBase64 = await convertBlobToBase64(audioBlob);

                if (audioBase64.length < 6) { // Minimum allowed length check
                    setRecordingError('Recording is too short.');
                    return;
                }

                await fetch(`${config.API_PRONOUNCE_BASE_URL}/GetAccuracyFromRecordedAudio`, {
                    method: "post",
                    body: JSON.stringify({ "title": "", "base64Audio": audioBase64, "language": 'en' }),
                    headers: { "X-Api-Key": STScoreAPIKey }

                }).then(res => res.json()).
                    then(data => {

                        setResponseData(data);

                    });
            };

            mediaRecorder.start();
            setIsRecording(true);
        } else {
            setRecordingError('Your browser does not support audio recording.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const playSpeechFromWord = async ( text: string ) => {
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

    const replayAudio = (startTime: number, endTime: number) => {
        if (audioRef.current) {
            // Ensure startTime and endTime are finite numbers
            const start = Number(startTime);
            const end = Number(endTime);

            // Ensure start and end are finite numbers and round to 4 decimal places
            const roundedStartTime = parseFloat(start.toFixed(4));
            const roundedEndTime = parseFloat(end.toFixed(4));
            
            if (roundedEndTime > roundedStartTime) {
                audioRef.current.currentTime = roundedStartTime;
                audioRef.current.play();
    
                const durationInSeconds = roundedEndTime - roundedStartTime;
                const durationInMs = Math.round(durationInSeconds * 1000);
    
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                }, durationInMs);
            } else {
                console.error('Invalid playback range: endTime must be greater than startTime.');
            }
        }
    };
    
    

    const getColoredMatchedTranscript = (
                                            matchedTranscript: string, 
                                            is_letter_correct_all_words: string, 
                                            real_transcripts_ipa: string,) => {
        const currentTextWords = matchedTranscript.split(' ');
        const lettersOfWordAreCorrect = is_letter_correct_all_words.split(' ');
        const realTranscript = real_transcripts_ipa.split(' ');
        const start_time = responseData.start_time;
        let end_time = responseData.end_time;
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
                        onClick={() => replayAudio(start_time[word_idx], end_time[word_idx])}
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
        <div className='p-4'>
            <div className='mb-4'>
            <button
                className={`py-2 px-4 text-white font-semibold rounded-lg ${isRecording ? 'bg-red-600 hover:bg-red:700' : 'bg-green-600 hover:bg-green:700'}`}
                onClick={isRecording ? stopRecording : startRecording}
                style={{ marginRight: '10px' }}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            </div>

            <hr className="border-t-2 border-black my-4" />

            {audioBlob && (
                <div>
                    <audio 
                        ref={audioRef} 
                        controls 
                        src={audioUrl ?? undefined} 
                        style={{ marginTop: '10px' }}
                    ></audio>
                </div>
            )}
            
            <div style={{ marginTop: '20px', fontSize: '24px' }}>
                {responseData ? (
                    getColoredMatchedTranscript(responseData.matched_transcripts, 
                                                responseData.is_letter_correct_all_words, 
                                                responseData.real_transcripts_ipa)
                ) : (
                    <p>Loading...</p>
                )}
            </div>

        </div>
    );
};

export default SpeakingDetail;