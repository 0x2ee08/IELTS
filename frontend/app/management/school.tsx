'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

interface SchoolLeftSideProps {
    school: string;
    schoollist: any[];
    onSchoolChange: (school: string) => void;
    onNewSchool: (school: string) => void;
}

const SchoolLeftSide: React.FC<SchoolLeftSideProps> = ({ school, schoollist, onSchoolChange, onNewSchool }) => {
    const [newschool, setNewschool] = useState('');

    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSchool = e.target.value;
        onSchoolChange(selectedSchool);
    };

    const addSchool = async (newschool: string) => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/add_school`, {role, newschool}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Successfully save new school');
        } catch (error) {
            console.error('Error adding school:', error);
            alert('Error adding school:' + error);
        }
    };


    const handleAddSchool = () => {
        addSchool(newschool);
        onNewSchool(newschool);
        setNewschool('');
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    School
                </label>
                <select
                    value={school}
                    onChange={handleSchoolChange}
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
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Add a new school (maybe you need to reload the page):
                </label>
                <textarea
                    value={newschool}
                    onChange={(e) => setNewschool(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-md w-full h-10"
                />
            </div>
            <div className="mb-4">
                <button 
                    onClick={handleAddSchool}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Save
                </button>
            </div>
        </div>
    );
};

export default SchoolLeftSide;
