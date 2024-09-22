import React, { useState } from 'react';
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
    statements: string[];
    features: string[];
}

interface QuestionPart {
    mcqs: MCQ[];
    tableFilling: TableFilling[];
    shortAnswerQuestions: ShortAnswerQuestion[];
    matchingExercise: MatchingExercise | null;
    selectedQuestionType: string;
}

const questionTypes = [
    { label: 'Multiple Choice Questions', value: 'mcq' },
    { label: 'Table Filling', value: 'tableFilling' },
    { label: 'Short Answer Questions', value: 'shortAnswer' },
    { label: 'Matching Exercise', value: 'matching' },
];

const ListeningPage = () => {
    const [sections, setSections] = useState<{
        script: Script | null;
        parts: QuestionPart[];
        error: string;
    }[]>([
        { script: null, parts: [{ mcqs: [], tableFilling: [], shortAnswerQuestions: [], matchingExercise: null, selectedQuestionType: 'mcq' }], error: '' }
    ]);

    const deleteSection = (index: number) => {
        setSections((prev) => prev.filter((_, i) => i !== index));
    };

    const addPart = (index: number) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[index].parts.push({
                mcqs: [],
                tableFilling: [],
                shortAnswerQuestions: [],
                matchingExercise: null,
                selectedQuestionType: 'mcq',
            });
            return newSections;
        });
    };

    const generateRandomScript = async (index: number) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_script`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data;
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].script = result;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Error generating script:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].script = null;
                newSections[index].error = 'An error occurred while generating the script.';
                return newSections;
            });
        }
    };

    const generateQuestions = async (index: number, partIndex: number) => {
        const selectedQuestionType = sections[index].parts[partIndex].selectedQuestionType;
        switch (selectedQuestionType) {
            case 'mcq':
                await generateMCQs(index, partIndex);
                break;
            case 'tableFilling':
                await generateTableFillingArray(index, partIndex);
                break;
            case 'shortAnswer':
                await generateShortAnswerQuestions(index, partIndex);
                break;
            case 'matching':
                await generateMatchingExercise(index, partIndex);
                break;
            default:
                break;
        }
    };

    const generateMCQs = async (index: number, partIndex: number) => {
        const script = sections[index].script;
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_multiple_choice`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result: MCQ[] = response.data;
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].parts[partIndex].mcqs = result;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Fetch error:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating MCQs.';
                newSections[index].parts[partIndex].mcqs = [];
                return newSections;
            });
        }
    };

    const generateTableFillingArray = async (index: number, partIndex: number) => {
        const script = sections[index].script;
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_table_filling`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result: TableFilling[] = response.data.tableFilling;
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].parts[partIndex].tableFilling = result;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Fetch error:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating Table Filling.';
                newSections[index].parts[partIndex].tableFilling = [];
                return newSections;
            });
        }
    };

    // Function to handle the change for short answer questions
    const handleShortAnswerChange = (
        sectionIndex: number,
        partIndex: number,
        questionIndex: number,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].parts[partIndex].shortAnswerQuestions[questionIndex].answers = [event.target.value];
            return newSections;
        });
    };

    // Function to handle selection for matching exercise
    const handleMatchingSelection = (
        sectionIndex: number,
        partIndex: number,
        statementIndex: number,
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].parts[partIndex].matchingExercise!.statements[statementIndex] = event.target.value;
            return newSections;
        });
    };

    const generateShortAnswerQuestions = async (index: number, partIndex: number) => {
        const script = sections[index].script;
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_short_answer_question`, { script }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].parts[partIndex].shortAnswerQuestions = response.data;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Error generating short answer questions:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating short answer questions.';
                newSections[index].parts[partIndex].shortAnswerQuestions = [];
                return newSections;
            });
        }
    };

    const generateMatchingExercise = async (index: number, partIndex: number) => {
        const script = sections[index].script;
        if (!script) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_listening_matchings`, { script }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = response.data;

            const statements = data.matchings.map((item: any) => item.question);
            const features = data.matchings.map((item: any) => item.feature);

            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].parts[partIndex].matchingExercise = { statements, features };
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Error generating matching exercise:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating the matching exercise.';
                newSections[index].parts[partIndex].matchingExercise = null;
                return newSections;
            });
        }
    };

    const handleScriptChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[index].script = { title: 'Custom Script', content: e.target.value };
            return newSections;
        });
    };

    const handleQuestionTypeChange = (sectionIndex: number, partIndex: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].parts[partIndex].selectedQuestionType = event.target.value;
            return newSections;
        });
    };

    return (
        <div>
            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                    <div>
                        <textarea
                            placeholder="Type your custom script here..."
                            onChange={(e) => handleScriptChange(sectionIndex, e)}
                            style={{ width: '100%', height: 'auto', minHeight: '100px', resize: 'none' }}
                            value={section.script ? section.script.content : ''}
                        />
                        <button onClick={() => generateRandomScript(sectionIndex)}>Generate Script</button>
                    </div>

                    {/* Delete section button */}
                    <button onClick={() => deleteSection(sectionIndex)}>Delete Section</button>

                    {/* Render Parts */}
                    {section.parts.map((part, partIndex) => (
                        <div key={partIndex} style={{ marginTop: '15px', padding: '10px', border: '1px solid #aaa' }}>
                            <h4>Part {partIndex + 1}</h4>

                            {/* Question Type Selector for each part */}
                            <div>
                                <label>Select Question Type:</label>
                                <select value={part.selectedQuestionType} onChange={(event) => handleQuestionTypeChange(sectionIndex, partIndex, event)}>
                                    {questionTypes.map((type, idx) => (
                                        <option key={idx} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Render selected question type */}
                            <button onClick={() => generateQuestions(sectionIndex, partIndex)}>Generate Questions</button>

                            {/* Display Multiple Choice Questions */}
                            {part.mcqs.length > 0 && (
                                <div>
                                    {part.mcqs.map((mcq, mcqIndex) => (
                                        <div key={mcqIndex}>
                                            <p><strong>{mcq.question}</strong></p>
                                            <div>
                                                {mcq.answers.map((answer, answerIndex) => (
                                                    <label key={answerIndex} style={{ display: 'block' }}>
                                                        <input type="radio" name={`question-${sectionIndex}-${partIndex}-${mcqIndex}`} />
                                                        {answer}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Table Filling */}
                            {part.tableFilling.length > 0 && (
                                <div>
                                    <h4>Table Filling:</h4>
                                    {part.tableFilling.map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            <p><strong>{item.category}:</strong> {item.information}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Short Answer Questions */}
                            {part.shortAnswerQuestions.length > 0 && (
                                <div>
                                    <h4>Short Answer Questions:</h4>
                                    {part.shortAnswerQuestions.map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            <p><strong>{item.question}</strong></p>
                                            <input
                                                type="text"
                                                placeholder="Type your answer here"
                                                onChange={(e) => handleShortAnswerChange(sectionIndex, partIndex, itemIndex, e)}
                                                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Render Matching Exercise */}
                            {part.matchingExercise !== null && (
                                <div>
                                    <h4>Matching Exercise:</h4>
                                    <div>
                                        <h5>Available Features:</h5>
                                        <ul>
                                            {part.matchingExercise.features.map((feature, featureIndex) => (
                                                <li key={featureIndex}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        {part.matchingExercise.statements.map((statement, statementIndex) => (
                                            <div key={statementIndex} style={{ marginBottom: '10px' }}>
                                                <p><strong>{statement}</strong></p>
                                                <select
                                                    onChange={(e) => handleMatchingSelection(sectionIndex, partIndex, statementIndex, e)}
                                                    style={{ width: '100%', padding: '5px' }}
                                                >
                                                    <option value="">Select Feature</option>
                                                    {part.matchingExercise.features.map((feature, featureIndex) => (
                                                        <option key={featureIndex} value={feature}>
                                                            {feature}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}

                    {/* Add more parts */}
                    <button onClick={() => addPart(sectionIndex)}>Add Part</button>

                    {/* Error message */}
                    {section.error && <p style={{ color: 'red' }}>{section.error}</p>}
                </div>
            ))}

            {/* Add new section */}
            <button onClick={() => setSections((prev) => [...prev, { script: null, parts: [{ mcqs: [], tableFilling: [], shortAnswerQuestions: [], matchingExercise: null, selectedQuestionType: 'mcq' }], error: '' }])}>
                Add Section
            </button>
        </div>
    );
};

export default ListeningPage;
