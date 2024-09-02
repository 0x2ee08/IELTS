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
    const [classlist, setClasslist] = useState<any[]>([]);
    const router = useRouter();

    const register = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, name, school, class_, password, role, tokens }),
            });
            const result = await response.json();

            if (response.ok) {
                alert('Register successful!');
                
                try {
                    const response2 = await fetch(`${config.API_BASE_URL}api/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, password }),
                    });
                    const result2 = await response2.json();
                    if (response2.ok) {
                        alert('Login successful!');
                        localStorage.setItem('token', result2.accessToken);
                        localStorage.setItem('username', result2.username);
                        localStorage.setItem('role', result2.role);
            
                        // Redirect to user page
                        router.push('/profile');
                    } else {
                        alert('Login failed: ' + result2.error);
                    }
        
                } finally {
                    setStatus('Successfully login');
                }
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

    const getClassList = async (school: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_class_list`, { school }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setClasslist(response.data.classlist || []);
        } finally {
            // handle final logic here if needed
        }
    };

    useEffect(() => {
        getSchoolList();
    }, []);

    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSchool = e.target.value;
        setSchool(selectedSchool);
        getClassList(selectedSchool);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex items-center justify-center p-8 bg-gray-200">
                <div className="bg-gray-200 w-full max-w-4xl h-[700px] p-8">
                    <div className="flex h-full rounded-lg overflow-hidden"> 
                    
                    <div className="w-1/3 bg-gray-100 flex items-center justify-center p-6"> 
                        <div className="w-full px-6"> 
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Email:</label>
                            <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-1.5 rounded-md w-full text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Name:</label>
                            <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-1.5 rounded-md w-full text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Username:</label>
                            <input 
                            type="text" 
                            className="border border-gray-300 px-3 py-1.5 rounded-md w-full text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Your School:</label>
                            <select
                            value={school}
                            onChange={handleSchoolChange}
                            className="border border-gray-300 px-3 py-1.5 rounded-md w-full text-sm"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Class:</label>
                            <select
                            value={class_}
                            onChange={(e) => setClass(e.target.value)}
                            className="border border-gray-300 px-3 py-1.5 rounded-md w-full text-sm"
                            >
                            <option value="">Select a class</option>
                            {classlist.map((_, idx) => (
                                <option key={classlist[idx]} value={classlist[idx]}>
                                {classlist[idx]}
                                </option>
                            ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Password:</label>
                            <input 
                            type="password" 
                            className="border border-gray-300 px-3 py-1.5 rounded-md w-full text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            className="w-full p-2 bg-[#0077B6] text-white rounded-full hover:bg-[#0077B6] text-sm"
                            onClick={register}
                        >
                            Register
                        </button>
                        </div>
                    </div>
                    <div className="w-2/3">
                        <img src="https://wallpapers.com/images/hd/blue-fade-9b4urca2ma6eh01o.jpg" alt="Description" className="h-full w-full object-cover" /> 
                    </div>
                    </div>
                </div>
                </div>
            <Footer /> 
        </div>
    );
};

export default RegisterPage;
