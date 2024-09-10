'use client';

import React, { useEffect, useState, useRef, useReducer } from 'react';
import axios from 'axios';
import Link from 'next/link';
import config from '../../config';
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';

interface ProfileData {
    avatar?: string;
    username?: string;
    email?: string;
    name?: string;
    school?: string;
    class_?: string;
    role?: string;
}

const ProfileDetail: React.FC = () => {
    const params = useSearchParams();
    const [data, setData] = useState<ProfileData | null>(null);
    const router = useRouter();

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getProfile();
            hasInitialize.current = true;
        }
    }, []);

    const getProfile = async () => {
        const username = params.get('id');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_data_profile_as_guest`, { username }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setData(response.data.result);
        } catch (error) {
            router.push('./404notfound')
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow flex flex-col items-center bg-gray-100 p-6">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                    <div className="flex justify-center mb-4">
                        <img src={(data && data.avatar) || '/default-avatar.png'} alt="Avatar" className="w-24 h-24 rounded-full" />
                    </div>
                    <p><strong>Username:</strong> {data?.username ?? 'N/A'}</p>
                    <p><strong>Email:</strong> {data?.email ?? 'N/A'}</p>
                    <p><strong>Name:</strong> {data?.name ?? 'N/A'}</p>
                    <p><strong>School:</strong> {data?.school ?? 'N/A'}</p>
                    <p><strong>Class:</strong> {data?.class_ ?? 'N/A'}</p>
                    <p><strong>Role:</strong> {data?.role ?? 'N/A'}</p>
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
        </div>
    );
};

export default ProfileDetail;
