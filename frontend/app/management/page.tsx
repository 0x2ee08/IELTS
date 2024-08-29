'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SchoolLeftSide from './school';
import ClassLeftSide from './class';

const ManagementPage: React.FC = () => {
    const [school, setSchool] = useState('');
    const [class_, setClass_] = useState('');
    const [classstring, setClassstring] = useState('');
    const [schoollist, setSchoollist] = useState<any[]>([]);
    const [classlist, setClasslist] = useState<any[]>([]);

    const getSchoolList = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_school_list`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSchoollist(response.data.result);
        } catch (error) {
            console.error('Error fetching school list:', error);
        }
    };

    const getClassList = async (selectedSchool: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_class_list`, { school: selectedSchool }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setClasslist(response.data.classlist || []);
        } catch (error) {
            console.error('Error fetching class list:', error);
        }
    };

    const handleSchoolChange = (newschool: string) => {
        setSchool(newschool);
        setClass_(''); // Reset class selection when school changes
        getClassList(newschool); // Fetch classes for the selected school
    };

    const handleNewSchool = (newschool: string) => {
        getSchoolList();
    };

    const handleClassChange = (processedClasses: string[]) => {
        // setClassstring(newClassString);
        setClasslist(processedClasses);
    };

    useEffect(() => {
        getSchoolList();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-row">
                {/* Left side of the page (school list) */}
                <div className="w-1/2 container mx-2 my-4 p-4 border border-gray-300 rounded shadow-md ml-4">
                    <SchoolLeftSide
                        school={school}
                        schoollist={schoollist}
                        onSchoolChange={handleSchoolChange}
                        onNewSchool={handleNewSchool}
                    />
                </div>

                {/* Right side of the page (class list) */}
                <div className="w-1/2 container mx-2 my-4 p-4 border border-gray-300 rounded shadow-md mr-4">
                    <ClassLeftSide
                        school={school}
                        class_={class_}
                        classlist={classlist}
                        classstring={classlist.join(', ')}
                        onClassChange={handleClassChange}
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ManagementPage;
