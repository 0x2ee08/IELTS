'use client'

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

type TopicData = {
    topic: string;
    statements: string[];
};

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [topics, setTopics] = useState<TopicData[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const extractStatements = async () => {
        const token = localStorage.getItem('token');

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                `${config.API_BASE_URL}api/import_file_writing_statements`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const result = response.data.topics;
            setTopics(result);
        } catch (err) {
            console.error('Error extracting topics and statements:', err);
            setError('An error occurred while extracting the topics and statements.');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };

    const chunkArray = (array: TopicData[], chunkSize: number): TopicData[][] => {
        const chunks: TopicData[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const uploadStatements = async () => {
        const token = localStorage.getItem('token');
        const topicChunks = chunkArray(topics, 5); // Split topics into chunks of 5

        try {
            for (const chunk of topicChunks) {
                await axios.post(
                    `${config.API_BASE_URL}api/upload_file_writing_statements`,
                    { topics: chunk },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
            console.log('All topics and statements uploaded successfully.');
        } catch (error) {
            console.error('Error uploading topics and statements:', error);
        }
    };

    const uploadingProblems = async () => {
        await extractStatements();
        await uploadStatements();
    };

    return (
        <div className="App">
            <h1>Upload a Text File to Extract Topics and Statements</h1>

            <input type="file" onChange={handleFileChange} />
            <button onClick={uploadingProblems} disabled={!file || loading}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Extracted Topics and Statements</h2>
            <ul>
                {topics.map((topicData, index) => (
                    <li key={index}>
                        <strong>{topicData.topic}</strong>
                        <ul>
                            {topicData.statements.map((statement, i) => (
                                <li key={i}>{statement}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
