'use client'

import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useState } from 'react';
import config from '../config';
import { useRouter } from 'next/navigation';

const SendEmailPage: React.FC = () => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('Password Reset For ielts.dtth.ch');
    const [text, setText] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [usercode, setUsercode] = useState('');
    const [code, setCode] = useState('');
    const [check, setCheck] = useState(false);
    const [newpassword, setNewpassword] = useState('');
    const router = useRouter();

    // Removed separate 'code' state and use local variable instead.
    const generateRandomCode = () => {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min; // Return generated code
    };

    const handleSendEmail = async () => {
        setStatus(null);
        setNewpassword('');

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
                alert('Email sent successfully!');
            } else {
                const result = await response.json();
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to send email');
        }
    };

    const change_password = async (email : string, newpassword : string) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/change_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, newpassword }),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Password Changed successful!');
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('username', result.username);
                localStorage.setItem('role', result.role);
    
                // Redirect to user page
            } else {
                alert('Changing failed: ' + result.error);
            }

        } finally {
        }
    };

    const handleChangePass = async () => {
        setCheck(false);
        try {
            console.log(usercode, code);
            if (usercode !== code) {
                alert("Wrong Verification Code. Please Check Again");
                return;
            }
            
            setCheck(true);
            change_password(to, newpassword);
            // router.push('/profile');
            // Optionally, redirect or update UI as needed
        } catch (error) {
            console.error("Error changing password:", error);
        } finally {
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex justify-center items-center bg-gray-200">
                <div className="bg-gray-100 p-6 rounded shadow-md w-full max-w-sm justify-center items-center">
                    <div className= "p-10">
                        <div className= "mb-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Code Received: (check in spam too)</label>
                            <input
                                className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                value={usercode}
                                onChange={(e) => setUsercode(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your New Password</label>
                            <input
                                type="password"
                                className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                value={newpassword}
                                onChange={(e) => setNewpassword(e.target.value)}
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
            </div>
            <Footer />
        </div>

    );
};

export default SendEmailPage;
