'use client'

import React, { useState, useRef, useEffect, ChangeEvent, use} from 'react';
import config from '../config';
import axios from 'axios';

declare const window: any;

interface MyComponentState {
    userInput: string;
}

const loginPage: React.FC = () => {
    const [ status, setStatus ] = useState('');
    const [ username, setUsername ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ name, setName ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ role ] = useState('student');

    const register = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, name, password, role }),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Register successful!');
                // Store the token or handle successful login
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('username', result.username);
                localStorage.setItem('role', result.role)
    
                // Redirect to user page
                // router.push('/user');
            } else {
                alert('Register failed: ' + result.error);
            }

        } finally {
        }
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Email:</label>
                <input
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // placeholder="Enter topic for the prompt"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Name:</label>
                <input
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // placeholder="Enter topic for the prompt"
                />
            </div>
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
                onClick={register}
            >
                Register
            </button>
        </div>
    );
};

export default loginPage;