'use client'

import React, { useState } from 'react';
import axios from 'axios';
import config from '../../../config';

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
            setTopics(result);  // Assuming `result` is an array of topics with statements
        } catch (err) {
            console.error('Error extracting topics and statements:', err);
            setError('An error occurred while extracting the topics and statements.');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };
    
    const uploadStatementsWriting = async () => {
        const token = localStorage.getItem('token');
    
        if (!topics || topics.length === 0) return;  // Ensure topics are available
    
        try {
            for (const topic of topics) {
                for (const statement of topic.statements) {  // Assuming each topic has a `statements` array
                    await axios.post(
                        `${config.API_BASE_URL}api/upload_file_writing_statements`,
                        { topic: topic.topic, statement: statement },  // Upload each statement individually
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                }
            }
            console.log('All topics and statements uploaded successfully.');
        } catch (error) {
            console.error('Error uploading topics and statements:', error);
            setError('An error occurred while uploading topics and statements.');
        }
    };
    
    const uploadingProblemsWriting = async () => {
        await extractStatements();
        await uploadStatementsWriting();
    };
    return (
        <div className="App">
            <div>
                <h1>Upload a Text File to Extract Topics and Statements</h1>

                <input type="file" onChange={handleFileChange} />
                <button onClick={uploadingProblemsWriting} disabled={!file || loading}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>

                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
};

export default App;
