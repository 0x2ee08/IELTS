'use client'

import React, { useState, useRef, useEffect, ChangeEvent} from 'react';
import config from '../config';
import axios from 'axios';

declare const window: any;

interface MyComponentState {
    userInput: string;
}

const SpeakingPage: React.FC = () => {
    const [ test ] = useState('b');
    const [ role ] = useState('admin');
    const [ username ] = useState('hsgs');
    const [ email ] = useState('hsgshackathon@gmail.com');
    const [ name ] = useState('hsgs2024');
    const [ password ] = useState('Hsgs2024');

    const saveToDataBase = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/save_to_database`, { test },{
                headers: {
                    'authorization': `Bearer ${token}`
                }
            });
        } finally {
        }
    };

    const register = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/register`, { username, email, name, password, role },{
            });
        } finally {
        }
    };

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
            localStorage.setItem('token', result.accessToken);
            localStorage.setItem('username', result.username);
            localStorage.setItem('role', result.role)
        } finally {
        }
    };

    return (
        <div>
            <button
                className="button p-2 my-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={saveToDataBase}
            >
                Up to database
            </button>

            <button
                className="button p-2 my-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={register}
            >
                Register
            </button>

            <button
                className="button p-2 my-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={login}
            >
                Login
            </button>
        </div>
    );
};

export default SpeakingPage;