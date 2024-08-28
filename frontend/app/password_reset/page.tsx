'use client'

import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useState } from 'react';
import config from '../config';

const SendEmailPage: React.FC = () => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('Password Reset For ielts.dtth.ch');
    const [text, setText] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [usercode, setUsercode] = useState('');
    const [code, setCode] = useState('');

    // Removed separate 'code' state and use local variable instead.
    const generateRandomCode = () => {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min; // Return generated code
    };

    const handleSendEmail = async () => {
        setStatus(null);

        // Generate the code and set the text with it
        const randomCode = generateRandomCode();
        const emailText = "Your code to reset password (please don't share this): " + randomCode;
        setCode(randomCode.toString());
        setText(emailText);

        try {
            const response = await fetch(`${config.API_BASE_URL}api/send_email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to, subject, text: emailText }), // Pass the updated text
            });

            if (response.ok) {
                setStatus('Email sent successfully!');
            } else {
                const result = await response.json();
                setStatus('Error: ' + result.error);
            }
        } catch (error) {
            setStatus('Failed to send email');
        }
    };

    const handleChangePass = async () => {
        setStatus(null);

        // Generate the code and set the text with it
        const randomCode = generateRandomCode();
        const emailText = "Your code to reset password (please don't share this): " + randomCode;
        setCode(randomCode.toString());
        setText(emailText);

        try {
            const response = await fetch(`${config.API_BASE_URL}api/send_email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to, subject, text: emailText }), // Pass the updated text
            });

            if (response.ok) {
                setStatus('Email sent successfully!');
            } else {
                const result = await response.json();
                setStatus('Error: ' + result.error);
            }
        } catch (error) {
            setStatus('Failed to send email');
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header /> {/* Header at the top */}
            <div className="flex-grow flex justify-center items-center bg-gray-100">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Gmail:</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <button
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleSendEmail}
                    >
                        Send Code
                    </button>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Code Received:</label>
                        <input
                            type="password"
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={usercode}
                            onChange={(e) => setUsercode(e.target.value)}
                        />
                    </div>
                    <button
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleChangePass}
                    >
                        Change Password
                    </button>
                </div>
            </div>
            <Footer /> {/* Footer at the bottom */}
        </div>
    );
};

export default SendEmailPage;
