'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('');
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header /> 
            <div className="flex-grow flex items-center justify-center p-8" style={{
                backgroundImage: 'linear-gradient(#d6f2fc, #baeef7, #d6f2fc)'
            }}>
                <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden flex">
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">LOGIN</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                className="border border-gray-300 px-4 py-3 rounded-md w-full focus:outline-none focus:border-[#00B4D8]"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="border border-gray-300 px-4 py-3 rounded-md w-full focus:outline-none focus:border-[#00B4D8]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right mb-6">
                            <a href="/password_reset" className="text-sm text-[#0077B6] hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                        <button
                            className="shadow-md w-full py-3 bg-[#47d6f8] text-white rounded-full hover:bg-[#00adef] transition duration-300"
                            onClick={login}
                        >
                            Login
                        </button>
                    </div>
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#00B4D8] to-[#48CAE4] flex items-center justify-center">
                        {/* You could replace the background with an image if preferred */}
                        <img src="https://static.vecteezy.com/system/resources/previews/004/369/833/non_2x/modern-abstract-gradient-blue-background-free-vector.jpg" alt="Gradient Background" className="h-full w-full object-cover" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
export default LoginPage;
