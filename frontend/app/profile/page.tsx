'use client'

import React, { useState, useEffect } from 'react';
import config from '../config';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ProfilePage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    const getMongoDB = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_data_profile`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setData(response.data.result);
        } finally {
            // Handle any cleanup if necessary
        }
    };

    useEffect(() => {
        getMongoDB();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header /> {/* Header at the top */}
            <div className="flex-grow flex justify-center items-center bg-gray-100">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                    {data.length > 0 ? (
                        <ul>
                            {data.map((user, index) => (
                                <li key={index} className="mb-4">
                                    <p><strong>Username:</strong> {user.username}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Name:</strong> {user.name}</p>
                                    <p><strong>School:</strong> {user.school}</p>
                                    <p><strong>Class:</strong> {user.class_}</p>
                                    <p><strong>Role:</strong> {user.role}</p>
                                    <p><strong>Current Tokens:</strong> {user.tokens}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center">No data available</p>
                    )}
                </div>
            </div>
            <Footer /> {/* Footer at the bottom */}
        </div>
    );
};

export default ProfilePage;
