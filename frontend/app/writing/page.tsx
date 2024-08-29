'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';
import WritingProbLoader from './prob_loader';

const WritingPage: React.FC = () => {

    const [ prob_id, setProb_id ] = useState('');
    

    const Load_Problem = async () => {

    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="mb-4 ml-4 mr-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Enter problem id:
                </label>
                <textarea
                    value={prob_id}
                    onChange={(e) => setProb_id(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-md"
                />
            </div>

            <div className="mb-4 ml-4 mr-4">
                <button 
                    onClick={ Load_Problem }
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Load Problem
                </button>
            </div>

            <div className="mb-4 ml-4 mr-4">
                <WritingProbLoader
                    prob_id= {prob_id}
                />
            </div>

            <Footer />
        </div>
    );
};

export default WritingPage;
