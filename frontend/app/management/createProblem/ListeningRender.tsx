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

const questionTypes = [
    { label: 'Multiple Choice Questions', value: 'mcq' },
    { label: 'Table Filling', value: 'tableFilling' },
    { label: 'Short Answer Questions', value: 'shortAnswer' },
    { label: 'Matching Exercise', value: 'matching' },
];

const ListeningPage = () => {
    const [sections, setSections] = useState<{ script: Script | null; mcqs: MCQ[]; tableFilling: TableFilling[]; shortAnswerQuestions: ShortAnswerQuestion[]; matchingExercise: MatchingExercise | null; error: string; selectedQuestionType: string; }[]>([
        { script: null, mcqs: [], tableFilling: [], shortAnswerQuestions: [], matchingExercise: null, error: '', selectedQuestionType: 'mcq' }
    ]);

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

    const generateMCQs = async (index: number) => {
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
                newSections[index].mcqs = result;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Fetch error:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating MCQs.';
                newSections[index].mcqs = [];
                return newSections;
            });
        }
    };

    const generateTableFillingArray = async (index: number) => {
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
                newSections[index].tableFilling = result;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Fetch error:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating Table Filling.';
                newSections[index].tableFilling = [];
                return newSections;
            });
        }
    };

    const generateShortAnswerQuestions = async (index: number) => {
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
                newSections[index].shortAnswerQuestions = response.data;
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Error generating short answer questions:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating short answer questions.';
                newSections[index].shortAnswerQuestions = [];
                return newSections;
            });
        }
    };

    const generateMatchingExercise = async (index: number) => {
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
                newSections[index].matchingExercise = { statements, features };
                newSections[index].error = '';
                return newSections;
            });
        } catch (error) {
            console.error('Error generating matching exercise:', error);
            setSections((prev) => {
                const newSections = [...prev];
                newSections[index].error = 'An error occurred while generating the matching exercise.';
                newSections[index].matchingExercise = null;
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

    const handleQuestionTypeChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[index].selectedQuestionType = event.target.value;
            return newSections;
        });
    };

    const generateQuestions = async (index: number) => {
        const selectedQuestionType = sections[index].selectedQuestionType;
        switch (selectedQuestionType) {
            case 'mcq':
                await generateMCQs(index);
                break;
            case 'tableFilling':
                await generateTableFillingArray(index);
                break;
            case 'shortAnswer':
                await generateShortAnswerQuestions(index);
                break;
            case 'matching':
                await generateMatchingExercise(index);
                break;
            default:
                break;
        }
    };

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            { script: null, mcqs: [], tableFilling: [], shortAnswerQuestions: [], matchingExercise: null, error: '', selectedQuestionType: 'mcq' }
        ]);
    };

    return (
        <div>
            {sections.map((section, index) => (
                <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                    {/* Section for script and question generation */}
                    <div>
                        <textarea
                            placeholder="Type your custom script here..."
                            onChange={(e) => handleScriptChange(index, e)}
                            style={{ width: '100%', height: 'auto', minHeight: '100px', resize: 'none' }}
                            value={section.script ? section.script.content : ''}
                        />
                        <button onClick={() => generateRandomScript(index)}>Generate Script</button>
                    </div>

                    {/* Dropdown for selecting question type */}
                    <div>
                        <label htmlFor={`questionType-${index}`}>Select Question Type:</label>
                        <select id={`questionType-${index}`} onChange={(e) => handleQuestionTypeChange(index, e)} value={section.selectedQuestionType}>
                            {questionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => generateQuestions(index)}>Generate Questions</button>
                    </div>

                    {/* Display Multiple Choice Questions */}
                    {section.mcqs.length > 0 && (
                        <div>
                            {section.mcqs.map((mcq, mcqIndex) => (
                                <div key={mcqIndex}>
                                    <p><strong>{mcq.question}</strong></p>
                                    <div>
                                        {mcq.answers.map((answer, answerIndex) => (
                                            <label key={answerIndex} style={{ display: 'block' }}>
                                                <input
                                                    type="radio"
                                                    name={`question-${index}-${mcqIndex}`}
                                                />
                                                {answer}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display Table Filling */}
                    {section.tableFilling.length > 0 && (
                        <div>
                            <h4>Table Filling:</h4>
                            {section.tableFilling.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                    <p><strong>{item.category}:</strong> {item.information}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display Short Answer Questions */}
                    {section.shortAnswerQuestions.length > 0 && (
                        <div>
                            <h4>Short Answer Questions:</h4>
                            {section.shortAnswerQuestions.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                    <p><strong>{item.question}</strong></p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display Matching Exercise */}
                    {section.matchingExercise && (
                        <div>
                            <h4>Matching Exercise:</h4>
                            <div>
                                {section.matchingExercise.statements.map((statement, statementIndex) => (
                                    <div key={statementIndex}>
                                        <p><strong>{statement}</strong></p>
                                    </div>
                                ))}
                                {section.matchingExercise.features.map((feature, featureIndex) => (
                                    <div key={featureIndex}>
                                        <p><strong>{feature}</strong></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error message */}   
                    {section.error && <p style={{ color: 'red' }}>{section.error}</p>}
                </div>
            ))}
            <button onClick={addSection}>Add Section</button>
        </div>
    );
};

export default ListeningPage;
