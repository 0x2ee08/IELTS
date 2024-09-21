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

interface ShortAnswerQuestion {
    question: string;
    answers: string[];
}

interface MatchingExercise {
    statements: string[]; // Array of statements
    features: string[];   // Array of features
}

const ListeningPage = () => {
    const [script, setScript] = useState<Script | null>(null);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [tableFilling, setTableFilling] = useState<TableFilling[]>([]);
    const [shortAnswerQuestions, setShortAnswerQuestions] = useState<ShortAnswerQuestion[]>([]);
    const [matchingExercise, setMatchingExercise] = useState<MatchingExercise | null>(null);
    const [error, setError] = useState('');
    const [userAnswers, setUserAnswers] = useState<{ [index: number]: string }>({});
    const [hiddenWords, setHiddenWords] = useState<{ [index: number]: { [wordIndex: number]: boolean } }>({});
    const [userShortAnswers, setUserShortAnswers] = useState<{ [index: number]: string }>({});
    const [selectedMatches, setSelectedMatches] = useState<{ [category: string]: string }>({});

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

    const generateShortAnswerQuestions = async () => {
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_short_answer_question`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setShortAnswerQuestions(response.data);
            setError('');
        } catch (error) {
            console.error('Error generating short answer questions:', error);
            setError('An error occurred while generating short answer questions.');
            setShortAnswerQuestions([]);
        }
    };

    const generateMatchingExercise = async () => {
        if (!script) return;
    
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_matchings`, { script }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = response.data;
    
            // Adjust this part based on the actual response format
            const statements = data.matchings.map((item: any) => item.question);
            const features = data.matchings.map((item: any) => item.feature);
    
            setMatchingExercise({ statements, features });
            setError('');
        } catch (error) {
            console.error('Error generating matching exercise:', error);
            setError('An error occurred while generating the matching exercise.');
            setMatchingExercise(null);
        }
    };

    const computeHiddenWordsForCategories = (tableData: TableFilling[]): { [index: number]: { [wordIndex: number]: boolean } } => {
        const hiddenWordsMap: { [index: number]: { [wordIndex: number]: boolean } } = {};
        const maxCategoriesToHide = 5;
        const hiddenCategoryIndices: Set<number> = new Set();

        while (hiddenCategoryIndices.size < Math.min(tableData.length, maxCategoriesToHide)) {
            const randomCategoryIndex = Math.floor(Math.random() * tableData.length);
            hiddenCategoryIndices.add(randomCategoryIndex);
        }

        hiddenCategoryIndices.forEach(categoryIndex => {
            const wordsArray = sanitizeText(tableData[categoryIndex].information).split(' ');

            const validWordIndices = wordsArray
                .map((word, wordIndex) => word.length <= 2 ? wordIndex : null)
                .filter(index => index !== null) as number[];

            if (validWordIndices.length > 0) {
                const randomWordIndex = validWordIndices[Math.floor(Math.random() * validWordIndices.length)];
                hiddenWordsMap[categoryIndex] = { [randomWordIndex]: true };
            }
        });

        return hiddenWordsMap;
    };

    const sanitizeText = (text?: string): string => {
        return text ? text.replace(/[,\[\]"]/g, '') : '';
    };

    const mergeTextboxes = (wordsArray: string[]): (string | JSX.Element)[] => {
        const result: (string | JSX.Element)[] = [];
        let inputSequence = false;
        let inputIndexStart = 0;
        let textBoxCount = 0;

        for (let i = 0; i < wordsArray.length; i++) {
            if (wordsArray[i] === '') {
                if (!inputSequence && textBoxCount < 5) {
                    inputSequence = true;
                    inputIndexStart = i;
                }
            } else {
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
                    textBoxCount++;
                }
                result.push(<span key={i} style={{ margin: '0 5px' }}>{wordsArray[i]}</span>);
            }
        }

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

    const handleInputChange = (index: number, value: string) => {
        setUserShortAnswers({ ...userShortAnswers, [index]: value });
    };

    const handleChooseBoxChange = (index: number, value: string) => {
        setSelectedMatches(prevState => ({
            ...prevState,
            [index]: value
        }));
    };

    useEffect(() => {
        if (tableFilling.length > 0) {
            const newHiddenWords = computeHiddenWordsForCategories(tableFilling);
            setHiddenWords(newHiddenWords);

            // Extract and log hidden words as strings
            const hiddenWordStrings = tableFilling.flatMap((entry, categoryIndex) => {
                const wordsArray = sanitizeText(entry.information).split(' ');
                return wordsArray
                    .map((word, wordIndex) =>
                        newHiddenWords[categoryIndex] && newHiddenWords[categoryIndex][wordIndex] ? word : null
                    )
                    .filter(word => word !== null) as string[];
            });

            console.log('Hidden Words (as strings):', hiddenWordStrings.join(', ')); // Log hidden words as a string
        }
    }, [tableFilling, script]);

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
                        {tableFilling.map((entry, categoryIndex) => {
                            const wordsArray = sanitizeText(entry.information).split(' ');

                            return (
                                <tr key={categoryIndex} style={{ textAlign: 'left', backgroundColor: categoryIndex % 2 === 0 ? '#fafafa' : '#fff' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sanitizeText(entry.category)}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {mergeTextboxes(
                                            wordsArray.map((word, wordIndex) =>
                                                hiddenWords[categoryIndex] && hiddenWords[categoryIndex][wordIndex] ? '' : word
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {script && (
                <div>
                    <button onClick={generateShortAnswerQuestions}>
                        Generate Short Answer Questions
                    </button>
                </div>
            )}

            {shortAnswerQuestions.length > 0 && (
                <div>
                    {shortAnswerQuestions.map((question, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <p><strong>{question.question}</strong></p>
                            <input
                                type="text"
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                value={userShortAnswers[index] || ''}
                                style={{ 
                                    border: '1px solid black', 
                                    padding: '5px', 
                                    width: '300px' // Adjust width as needed
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {script && (
                <div>
                    <button onClick={generateMatchingExercise}>Generate Matching Exercise</button>
                </div>
            )}

            {matchingExercise && (
                <div>
                    {/* Display features at the top */}
                    <div>
                        <p><strong>Features:</strong></p>
                        <ul>
                            {matchingExercise.features.map((feature, featureIndex) => (
                                <li key={featureIndex}>{feature}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        {matchingExercise.statements.map((statement, index) => {
                            // Get the selected feature's index
                            const selectedFeature = selectedMatches[index];
                            const selectedFeatureIndex = matchingExercise.features.indexOf(selectedFeature);

                            return (
                                <div key={index} style={{ marginBottom: '10px' }}>
                                    <p>{statement}</p>
                                    <div>
                                        <label htmlFor={`choosebox-${index}`}>Your answer: </label>
                                        <select
                                            id={`choosebox-${index}`}
                                            onChange={(e) => handleChooseBoxChange(index, e.target.value)}
                                            value={selectedMatches[index] || ''}
                                        >
                                            <option value=""></option>
                                            {matchingExercise.features.map((feature, featureIndex) => (
                                                <option key={featureIndex} value={feature}>
                                                    {feature[0]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}

        </div>
    );
};

export default ListeningPage;

