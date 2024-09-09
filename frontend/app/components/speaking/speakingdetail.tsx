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
    const STScoreAPIKey = 'rll5QsTiv83nti99BW6uCmvs9BDVxSB39SVFceYb'; // Replace with your API key

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
    
    

    const getColoredMatchedTranscript = (matchedTranscript: string, is_letter_correct_all_words: string) => {
        const currentTextWords = matchedTranscript.split(' ');
        const lettersOfWordAreCorrect = is_letter_correct_all_words.split(" ")
        let coloredWords = [];
        const start_time = responseData.start_time;
        let end_time = responseData.end_time;

        // for (let i = 0; i < end_time.length - 1; i++) {
        //     end_time[i] = start_time[i + 1] - 0.01; 
        // }
    
        for (let word_idx = 0; word_idx < currentTextWords.length; word_idx++) {
            const currentWord = currentTextWords[word_idx]; // Current word
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
                <span 
                    key={`word-${word_idx}`} 
                    onClick={() => replayAudio(start_time[word_idx], end_time[word_idx])} 
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                >
                    {wordTemp}
                </span>
            );
        }
    
        return coloredWords;
    };

    return (
        <div style={{ padding: '20px' }}>
            <button 
                onClick={isRecording ? stopRecording : startRecording} 
                style={{ marginRight: '10px' }}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {audioBlob && (
                <div>
                    <audio 
                        ref={audioRef} 
                        controls 
                        src={audioUrl ?? undefined} 
                        style={{ marginTop: '10px' }}
                    ></audio>
                    <button 
                        onClick={() => replayAudio(0, audioRef.current?.duration || 0)} 
                        style={{ marginTop: '10px' }}
                    >
                        Replay
                    </button>
                </div>
            )}
            {recordingError && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    {recordingError}
                </div>
            )}
            {responseData && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Recorded Data</h3>
                    <p><strong>IPA Transcript:</strong> {responseData.ipa_transcript}</p>
                    <p><strong>Pronunciation Accuracy:</strong> {responseData.pronunciation_accuracy}%</p>
                    <p><strong>Real Transcript:</strong> {responseData.real_transcript}</p>
                    <p><strong>Expected Transcripts:</strong> {responseData.real_transcripts}</p>
                    <p><strong>Matched Transcripts:</strong> {responseData.matched_transcripts}</p>
                    <p><strong>Real Transcripts IPA:</strong> {responseData.real_transcripts_ipa}</p>
                    <p><strong>Matched Transcripts IPA:</strong> {responseData.matched_transcripts_ipa}</p>
                    <p><strong>Pair Accuracy Category:</strong> {responseData.pair_accuracy_category}</p>
                    <p><strong>Start Time:</strong> {responseData.start_time}</p>
                    <p><strong>End Time:</strong> {responseData.end_time}</p>
                    <p><strong>Is Letter Correct All Words:</strong> {responseData.is_letter_correct_all_words}</p>
                </div>
            )}
            
            <div style={{ marginTop: '20px', fontSize: '24px' }}>
                <h4><strong>Matched Transcript:</strong></h4>
                {responseData && responseData.matched_transcripts && responseData.is_letter_correct_all_words ? (
                    getColoredMatchedTranscript(responseData.matched_transcripts, responseData.is_letter_correct_all_words)
                ) : (
                    <p>Loading...</p>
                )}
            </div>

        </div>
    );
};

export default SpeakingDetail;