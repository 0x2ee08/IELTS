'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

const RegisterPage: React.FC = () => {
    const [status, setStatus] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [school, setSchool] = useState(''); // Initial state
    const [class_, setClass] = useState('');
    const [tokens, setToken] = useState(10);
    const [role] = useState('student');
    const [schoollist, setSchoollist] = useState<any[]>([]);
    const router = useRouter();

    const register = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, name, class_, school, password, role, tokens }),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Register successful!');
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('username', result.username);
                localStorage.setItem('role', result.role);
    
                // Redirect to user page
                router.push('/profile');
            } else {
                alert('Register failed: ' + result.error);
            }
        } finally {
            setStatus('Registration completed');
        }
    };

    const getSchoolList = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_school_list`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSchoollist(response.data.result);
        } finally {
            // handle final logic here if needed
        }
    };

    useEffect(() => {
        getSchoolList();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header /> {/* Header at the top */}
            <div className="flex-grow flex justify-center items-center bg-gray-100">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Email:</label>
                        <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Name:</label>
                        <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Username:</label>
                        <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Class:</label>
                        <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={class_}
                            onChange={(e) => setClass(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Your School:</label>
                        <select
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                        >
                            <option value="">Select a school</option>
                            {schoollist.map((schoolOption) => (
                                <option key={schoolOption.id} value={schoolOption.id}>
                                    {schoolOption.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Password:</label>
                        <input 
                            type="password" 
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={register}
                    >
                        Register
                    </button>
                </div>
            </div>
            <Footer /> {/* Footer at the bottom */}
        </div>
    );
};

export default RegisterPage;
