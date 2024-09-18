'use client'

import React, { useState } from 'react';
import config from '../../config';
import axios from 'axios'

interface Script {
    title: string;
    content: string;
}

interface MCQ {
    question: string;
    answers: string[];
}

const TableFilling = () => {
    const [script, setScript] = useState<Script | null>(null);
    const [mcqs, setMcqs] = useState<{ question: string, answers: string[] }[]>([]); // Store question and answers separately
    const [error, setError] = useState('');
    const [isMcqButtonVisible, setMcqButtonVisible] = useState(false); // For showing the "Generate MCQs" button
    const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({}); // To track selected answers for each question

    // Function to generate the random script (without questions, just the script)
    const generateRandomScript = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_script`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data
            setScript(result)
        } catch (error) {
            console.error('Error generating paragraph:', error);
            setScript(null)
        }
    };

    // Function to generate MCQs based on the generated script
    const generateMCQs = async () => {
        if (!script) return; // Ensure there's a script to generate MCQs

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_multiple_choice`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result: MCQ[] = response.data;
            setMcqs(result); // Store the generated MCQs
        } catch (error) {
            console.error('Fetch error:', error);
            setError('An error occurred while generating MCQs.');
            setMcqs([]); // Clear MCQs on error
        }
    };

    // Function to handle answer selection for each question
    const handleAnswerSelection = (questionIndex: number, answer: string) => {
        setSelectedAnswers(prevSelected => ({
            ...prevSelected,
            [questionIndex]: answer, // Store the selected answer for the given question
        }));
    };

    return (
        <div>
            <button onClick={generateRandomScript}>
                Generate Script
            </button>

            {script && (
                <div>
                    <h2>{script.title}</h2> {/* Render the title */}
                    <p>{script.content}</p> {/* Render the content */}
                </div>
            )}

            {/* Show the button for generating MCQs only after the script is generated */}
            {script && (
                <div>
                    <button
                        onClick={() => generateMCQs()}
                    >
                        Generate Multiple Choice Questions
                    </button>
                </div>
            )}

            {mcqs.length > 0 && (
                <div>
                    {mcqs.map((mcq, index) => (
                        <div key={index}>
                            <p><strong>{mcq.question}</strong></p>
                            {/* Render answers with checkboxes, one answer per question */}
                            <div>
                                {mcq.answers.map((answer, answerIndex) => (
                                    <label key={answerIndex} style={{ display: 'block' }}>
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            checked={selectedAnswers[index] === answer}
                                            onChange={() => handleAnswerSelection(index, answer)}
                                        />
                                        {answer} {/* Displaying A, B, C, D */}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default TableFilling;
