'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

interface ProbLoaderProps {
    prob_id: string
}

const ProbLoader: React.FC<ProbLoaderProps> = ({ prob_id }) => {
    const [ statement, setStatement ] = useState('');
    const [ questionlist, setQuestionlist] = useState([]);
    const [ answerlist, setAnswerlist] = useState([]);

    const get_prob_data = async () => { 
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/get__writing_prob_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ prob_id }),
            });
            const result = await response.json();
            setStatement(result.statement);
            setQuestionlist(result.questionlist);
            setAnswerlist(result.answerlist);
            if (response.ok) {
                // alert('Update successful!');
            } else {
                alert('Get failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error getting problem:', error);
        }
    }

    return (
        <div>
            <div className="mb-4 ml-4 mr-4">
                <button
                onClick={get_prob_data}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                Load Problem
                </button>
            </div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
                Detail for problem with id {prob_id}:
            </label>

            <p>Statement: {statement}</p>
            {questionlist.map((question, idx) => (
                <p key={idx}>question #{idx}: {question}</p>
            ))}
            {answerlist.map((answer, idx) => (
                <p key={idx}>answer #{idx}: {answer}</p>
            ))}
        </div>
    );
};

export default ProbLoader;
