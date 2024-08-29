'use client'

import React, { useState, useEffect } from 'react';
import config from '../config';

interface ClassLeftSideProps {
    school: string;
    class_: string;
    classlist: any[];
    classstring: string;
    onClassChange: (processedClasses: string[]) => void;
}

const ClassLeftSide: React.FC<ClassLeftSideProps> = ({ school, class_, classlist, classstring, onClassChange }) => {
    const [str, setStr] = useState(classstring);

    // Sync str with classstring whenever classstring changes
    useEffect(() => {
        setStr(classstring);
    }, [classstring]);

    const handleClassChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputString = e.target.value;
        setStr(inputString);
    };

    const update_class_list = async (classlist: string[]) => {
        console.log(classlist);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/update_class_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ school, classlist }),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Update successful!');
            } else {
                alert('Update failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating class list:', error);
        }
    };

    const handleSubmit = async () => {
        const processedClasses = str
            .split(',')
            .map(item => item.trim()) // Remove leftmost and rightmost spaces
            .filter(item => item !== ''); // Remove any empty items
        onClassChange(processedClasses);
        await update_class_list(processedClasses);
        console.log(processedClasses);
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Class
                </label>
                <textarea
                    value={str}
                    onChange={handleClassChange}
                    className="border border-gray-300 px-3 py-2 rounded-md w-full h-32"
                    disabled={!school}
                />
            </div>
            <div className="mb-4">
                <button 
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Save
                </button>
            </div>
        </div>
    );
};

export default ClassLeftSide;
