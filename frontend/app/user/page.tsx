'use client'

import React, { useState, useRef, useEffect, ChangeEvent, use} from 'react';
import config from '../config';
import axios from 'axios';

declare const window: any;

interface MyComponentState {
    userInput: string;
}

const loginPage: React.FC = () => {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ status, setStatus ] = useState('');

    const login = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Login successful!');
                // Store the token or handle successful login
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('username', result.username);
                localStorage.setItem('role', result.role)
    
                // Redirect to user page
                // router.push('/user');
            } else {
                alert('Login failed: ' + result.error);
            }

        } finally {
        
            setStatus('Successfully login');
        }
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Username:</label>
                <input
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    // placeholder="Enter topic for the prompt"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Password:</label>
                <input
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // placeholder="Enter topic for the prompt"
                />
            </div>
            <button
                className="button p-2 my-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={login}
            >
                Login
            </button>
        </div>
    );
};

export default loginPage;