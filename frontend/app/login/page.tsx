'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const router = useRouter();

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
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('username', result.username);
                localStorage.setItem('role', result.role);
    
                // Redirect to user page
                router.push('/profile');
            } else {
                alert('Login failed: ' + result.error);
            }

        } finally {
            setStatus('Successfully login');
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header /> {/* Header at the top */}
            <div className="flex-grow flex justify-center items-center bg-gray-100">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Password:</label>
                        <input
                            type="password"
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-4 text-right">
                        <a href="/password_reset" className="text-sm text-blue-500 hover:underline">
                            Forgot your password?
                        </a>
                    </div>
                    <button
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={login}
                    >
                        Login
                    </button>
                </div>
            </div>
            <Footer /> {/* Footer at the bottom */}
        </div>
    );
};
export default LoginPage;
