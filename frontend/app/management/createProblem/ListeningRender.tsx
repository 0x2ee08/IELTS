import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';

interface Script {
    title: string;
    content: string;
}

interface MCQ {
    question: string;
    answers: string[];
}

interface TableFilling {
    category: string;
    information: string;
}

const ListeningPage = () => {
    const [script, setScript] = useState<Script | null>(null);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [tableFilling, setTableFilling] = useState<TableFilling[]>([]);
    const [error, setError] = useState('');
    const [userAnswers, setUserAnswers] = useState<{ [index: number]: string }>({});
    const [hiddenWords, setHiddenWords] = useState<{ [index: number]: boolean }>({});

    // Function to generate the random script (without questions, just the script)
    const generateRandomScript = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_script`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data;
            setScript(result);
            setError('');
        } catch (error) {
            console.error('Error generating script:', error);
            setScript(null);
            setError('An error occurred while generating the script.');
        }
    };

    // Function to generate MCQs based on the generated script
    const generateMCQs = async () => {
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_multiple_choice`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result: MCQ[] = response.data;
            setMcqs(result);
            setError('');
        } catch (error) {
            console.error('Fetch error:', error);
            setError('An error occurred while generating MCQs.');
            setMcqs([]);
        }
    };

    // Function to generate Table Filling based on the generated script
    const generateTableFillingArray = async () => {
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_table_filling`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result: TableFilling[] = response.data.tableFilling;
            setTableFilling(result);
            setError('');
        } catch (error) {
            console.error('Fetch error:', error);
            setError('An error occurred while generating Table Filling.');
            setTableFilling([]);
        }
    };

    // Function to hide words and generate hidden words map
    const computeHiddenWords = (text: string, hideRatio: number = 0.3): { [index: number]: boolean } => {
        const words = text.split(' ');
        const numberOfWordsToHide = Math.min(Math.floor(words.length * hideRatio), 5); // Limit to max 5 hidden inputs
        const hiddenIndices: Set<number> = new Set();

        // Randomly pick indices to hide words
        while (hiddenIndices.size < numberOfWordsToHide) {
            const randomIndex = Math.floor(Math.random() * words.length);
            hiddenIndices.add(randomIndex); // Set ensures each index is unique
        }

        // Create a map of hidden words
        const hiddenWordsMap: { [index: number]: boolean } = {};
        hiddenIndices.forEach(index => hiddenWordsMap[index] = true);

        return hiddenWordsMap;
    };

    // Function to sanitize text
    const sanitizeText = (text?: string): string => {
        return text ? text.replace(/[,\[\]"]/g, '') : '';
    };

    // Function to merge consecutive blank inputs and limit to max 5
    const mergeTextboxes = (wordsArray: string[]): (string | JSX.Element)[] => {
        const result: (string | JSX.Element)[] = [];
        let inputSequence = false; // Track if we are in the middle of an input sequence
        let inputIndexStart = 0;   // Track the start of a sequence of inputs
        let textBoxCount = 0;      // Count the number of textboxes created

        for (let i = 0; i < wordsArray.length; i++) {
            if (wordsArray[i] === '') {
                // If starting a new sequence of inputs and still under limit of 5 textboxes
                if (!inputSequence && textBoxCount < 5) {
                    inputSequence = true;
                    inputIndexStart = i;
                }
            } else {
                // If an input sequence ends, add a textbox for the entire sequence
                if (inputSequence && textBoxCount < 5) {
                    result.push(
                        <input
                            key={`input-${inputIndexStart}-${i}`}
                            type="text"
                            style={{ width: `${(i - inputIndexStart) * 80}px`, margin: '0 5px', border: '1px solid black' }}
                            onChange={(e) => setUserAnswers({ ...userAnswers, [`input-${inputIndexStart}-${i}`]: e.target.value })}
                        />
                    );
                    inputSequence = false;
                    textBoxCount++; // Increment textbox count
                }
                // Add the visible word
                result.push(<span key={i} style={{ margin: '0 5px' }}>{wordsArray[i]}</span>);
            }
        }

        // If there was an input sequence at the end and still under limit of 5 textboxes
        if (inputSequence && textBoxCount < 5) {
            result.push(
                <input
                    key={`input-${inputIndexStart}-end`}
                    type="text"
                    style={{ width: `${(wordsArray.length - inputIndexStart) * 80}px`, margin: '0 5px', border: '1px solid black' }}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [`input-${inputIndexStart}-end`]: e.target.value })}
                />
            );
            textBoxCount++;
        }

        return result;
    };

    // Effect to compute hidden words whenever tableFilling or script changes
    useEffect(() => {
        if (tableFilling.length > 0) {
            const newHiddenWords: { [index: number]: boolean } = {};
            tableFilling.forEach(entry => {
                const wordsArray = sanitizeText(entry.information).split(' ');
                const hiddenWordsMap = computeHiddenWords(sanitizeText(entry.information), 0.3);
                Object.assign(newHiddenWords, hiddenWordsMap);
            });
            setHiddenWords(newHiddenWords);
        }
    }, [tableFilling, script]); // Recompute hidden words when tableFilling or script changes

    return (
        <div>
            <button onClick={generateRandomScript}>
                Generate Script
            </button>

            {script && (
                <div>
                    <h2>{script.title}</h2>
                    <p>{script.content}</p>
                </div>
            )}

            {script && (
                <div>
                    <button onClick={generateMCQs}>
                        Generate Multiple Choice Questions
                    </button>
                </div>
            )}

            {mcqs.length > 0 && (
                <div>
                    {mcqs.map((mcq, index) => (
                        <div key={index}>
                            <p><strong>{mcq.question}</strong></p>
                            <div>
                                {mcq.answers.map((answer, answerIndex) => (
                                    <label key={answerIndex} style={{ display: 'block' }}>
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            onChange={() => setUserAnswers({ ...userAnswers, [index]: answer })}
                                        />
                                        {answer}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {script && (
                <div>
                    <button onClick={generateTableFillingArray}>
                        Generate Table Filling
                    </button>
                </div>
            )}

            {tableFilling.length > 0 && (
                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Information (Fill in the blanks)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableFilling.map((entry, index) => {
                            const wordsArray = sanitizeText(entry.information).split(' ');

                            return (
                                <tr key={index} style={{ textAlign: 'left', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sanitizeText(entry.category)}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {mergeTextboxes(wordsArray.map((word, i) => hiddenWords[i] ? '' : word))} {/* Merge consecutive textboxes, max 5 */}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ListeningPage;
