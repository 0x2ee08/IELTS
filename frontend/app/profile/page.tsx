'use client'

import React, { useState, useRef, useEffect, ChangeEvent, use} from 'react';
import config from '../config';
import axios from 'axios';

declare const window: any;

interface MyComponentState {
    userInput: string;
}

const profilePage: React.FC = () => {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ status, setStatus ] = useState('');
    const [ data, setData ] = useState<any[]>([]); 

    const getMongoDB = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_data_profile`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setData(response.data.result);
        } finally {
            
        }
    };

    return (
        <div>
            <button onClick={getMongoDB}>
                Fetch Data From Database
            </button>

            {data.length > 0 ? (
                <ul>
                    {data.map((user, index) => (
                        <li key={index}>
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Class:</strong> {user.class_}</p>
                            <p><strong>School:</strong> {user.school}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Current Tokens:</strong> {user.tokens}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};

export default profilePage;