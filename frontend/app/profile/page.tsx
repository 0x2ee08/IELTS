'use client'

import React, { useState, useEffect } from 'react';
import config from '../config';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ProfilePage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        class_: '',
        avatar: '',
    });
    const [schoollist, setSchoollist] = useState<any[]>([]);
    const [classlist, setClasslist] = useState<any[]>([]);

    const getMongoDB = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_data_profile`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const profileData = response.data.result[0]; // Assuming single user profile data
            setData([profileData]);
            formData.name = profileData.name;
            formData.school = profileData.school;
            formData.class_ = profileData.class_;
            formData.avatar = profileData.avatar;
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
        getClassList(formData.school);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSchool = e.target.value;
        formData.school = selectedSchool;
        getClassList(selectedSchool);
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            name: formData.name, 
            school: formData.school, 
            class_:e.target.value, 
            avatar:formData.avatar,
        })
    };

    const update_profile = async (name: string, school: string, class_: string, avatar: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/update_profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({name, school, class_, avatar}),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Update successful!');
                // localStorage.setItem('token', result.accessToken);
                // localStorage.setItem('username', result.username);
                // localStorage.setItem('role', result.role);
    
                // Redirect to user page
                // router.push('/profile');
            } else {
                alert('Update failed: ' + result.error);
            }

        } finally {
        }
    };

    const handleFormSubmit = async () => {
        update_profile(formData.name, formData.school, formData.class_, formData.avatar);
    };

    useEffect(() => {
        getMongoDB();
        getSchoolList();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex flex-col items-center bg-gray-100 p-6">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                    {data.length > 0 ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <img src={formData.avatar || '/default-avatar.png'} alt="Avatar" className="w-24 h-24 rounded-full" />
                            </div>
                            {editMode ? (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            School
                                        </label>
                                        <select
                                            value={formData.school}
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
                                            Class
                                        </label>
                                        <select
                                            value={formData.class_}
                                            onChange={handleClassChange}
                                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
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
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Avatar URL
                                        </label>
                                        <input
                                            type="text"
                                            name="avatar"
                                            value={formData.avatar}
                                            onChange={handleInputChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <button 
                                            onClick={handleFormSubmit}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                            Save
                                        </button>
                                        <button onClick={handleEditToggle} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p><strong>Username:</strong> {data[0].username}</p>
                                    <p><strong>Email:</strong> {data[0].email}</p>
                                    <p><strong>Name:</strong> {formData.name}</p>
                                    <p><strong>School:</strong> {formData.school}</p>
                                    <p><strong>Class:</strong> {formData.class_}</p>
                                    <p><strong>Role:</strong> {data[0].role}</p>
                                    <p><strong>Current Tokens:</strong> {data[0].tokens}</p>
                                    <button onClick={handleEditToggle} className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center">No data available</p>
                    )}
                </div>
                <div className="mt-8 w-full max-w-md bg-white p-6 rounded shadow-md">
                    <h3 className="text-lg font-bold mb-4">Activity</h3>
                    {/* Example activity heatmap (replace with actual data visualization) */}
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 30 }).map((_, index) => (
                            <div key={index} className={`h-4 ${index % 2 === 0 ? 'bg-green-400' : 'bg-green-200'}`} />
                        ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-4">
                        <p>159 problems solved for all time</p>
                        <p>33 days in a row max</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
