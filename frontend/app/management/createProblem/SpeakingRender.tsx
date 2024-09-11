// app/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

import Head from 'next/head';
import Link from 'next/link';

const SpeakingPage: React.FC = () => {
    const [ generatedTask, setGeneratedTask ] = useState('');

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            generateSpeakingTask1(3);
            hasInitialize.current = true;
        }
    }, []);

    const generateSpeakingTask1 = async ( number_of_task: number ) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/generateSpeakingTask1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ number_of_task }),
        })
        const result = await response.json();
        setGeneratedTask(result.content);
    }

    return (
        <div>
            <div className="flex flex-col min-h-screen">
                
                {generatedTask}
                
            </div>
        </div>
    );
}
export default SpeakingPage;

