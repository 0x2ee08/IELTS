'use client'

import React, { useState } from 'react';

const YOUR_API_KEY = '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';

const TableFilling = () => {
    const [script, setScript] = useState('');
    const [mcqs, setMcqs] = useState<{ question: string, answers: string[] }[]>([]); // Store question and answers separately
    const [error, setError] = useState('');
    const [isMcqButtonVisible, setMcqButtonVisible] = useState(false); // For showing the "Generate MCQs" button
    const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({}); // To track selected answers for each question

    // Function to generate the random script (without questions, just the script)
    const generateRandomScript = async () => {
        try {
            const message = `Generate a random topic script for the IELTS Listening Table Filling section without any bold text, special characters, or additional text. Provide only the script.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${YOUR_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "openai/gpt-4o",
                    "messages": [
                        { "role": "user", "content": message },
                    ],
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.message}`);
            }

            const data = await response.json();
            const messageContent = data.choices[0]?.message?.content || 'No content available';
            setScript(messageContent.trim()); // Trim any extra whitespace
            setError('');
            setMcqButtonVisible(true); // Show the "Generate MCQs" button after generating the script

        } catch (error) {
            console.error('Fetch error:', error);
            setError(`An error occurred: ` + error);
            setScript('');
            setMcqButtonVisible(false); // Hide the button if there's an error
        }
    };

    // Function to generate MCQs based on the generated script (well-formatted questions)
    const generateMCQs = async () => {
        try {
            const message = `Create 5 multiple choice questions for IELTS Listening based on the following script, without special characters or additional text or endlines. Format each question with simple labels A, B, C, and D for the answers. Use plain text for clarity:\n\n${script}`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${YOUR_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "openai/gpt-4o",
                    "messages": [
                        { "role": "user", "content": message },
                    ],
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.message}`);
            }

            const data = await response.json();
            const mcqContent = data.choices[0]?.message?.content || 'No MCQs available';

            // Parsing the MCQ content to extract question and answer options
            const parsedMcqs = mcqContent.split('\n\n').map((mcq: string) => {
                const lines = mcq.split('\n');
                const question = lines[0]; // The first line is the question
                const answers = lines.slice(1).filter(Boolean); // Remove empty answers (if any)
                return { question, answers };
            });

            setMcqs(parsedMcqs);

        } catch (error) {
            console.error('Fetch error:', error);
            setError(`An error occurred while generating MCQs: ` + error);
            setMcqs([]);
        }
    };

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
                    <pre>{script}</pre>
                </div>
            )}

            {/* Show the button for generating MCQs only after the script is generated */}
            {isMcqButtonVisible && (
                <button onClick={generateMCQs}>
                    Generate MCQs
                </button>
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
