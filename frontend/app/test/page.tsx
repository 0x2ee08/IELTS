'use client'

import React, { useState, useRef, useEffect, ChangeEvent} from 'react';
import config from '../config';
import axios from 'axios';

declare const window: any;

interface MyComponentState {
    userInput: string;
}

const SpeakingPage: React.FC = () => {
    const [ test ] = useState('anHiep');

    const saveToDataBase = async () => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/save_to_database`, { test },{
                // headers: {
                //     'Authorization': `Bearer ${token}`
                // }
            });
        } finally {
        }
    };

    return (
        <div>
            <button
                className="button p-2 my-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={saveToDataBase}
            >
                Click here
            </button>
        </div>
    );
};

export default SpeakingPage;