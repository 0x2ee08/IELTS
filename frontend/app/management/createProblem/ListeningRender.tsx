'use client'

import React, { useState } from 'react';
import config from '../../config';
import axios from 'axios'

interface Script {
    title: string;
    content: string;
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

    // Function to generate MCQs based on the generated script (well-formatted questions)
    // const generateMCQs = async () => {
    //     try {
    //         const message = `Create 5 multiple choice questions for IELTS Listening based on the following script, without special characters or additional text or endlines. Format each question with simple labels A, B, C, and D for the answers. Use plain text for clarity:\n\n${script}`;

    //         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    //             method: 'POST',
    //             headers: {
    //                 "Authorization": `Bearer ${YOUR_API_KEY}`,
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 "model": "openai/gpt-4o",
    //                 "messages": [
    //                     { "role": "user", "content": message },
    //                 ],
    //             })
    //         });

    //         if (!response.ok) {
    //             const err = await response.json();
    //             throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.message}`);
    //         }

    //         const data = await response.json();
    //         const mcqContent = data.choices[0]?.message?.content || 'No MCQs available';

    //         // Parsing the MCQ content to extract question and answer options
    //         const parsedMcqs = mcqContent.split('\n\n').map((mcq: string) => {
    //             const lines = mcq.split('\n');
    //             const question = lines[0]; // The first line is the question
    //             const answers = lines.slice(1).filter(Boolean); // Remove empty answers (if any)
    //             return { question, answers };
    //         });

    //         setMcqs(parsedMcqs);

    //     } catch (error) {
    //         console.error('Fetch error:', error);
    //         setError(`An error occurred while generating MCQs: ` + error);
    //         setMcqs([]);
    //     }
    // };

    // Function to handle checkbox selection
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
