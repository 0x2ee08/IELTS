// ReadingRender.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';

export interface Question {
    question: string;
    answer: string;
    explanation: string;
    options: string;
}

export interface Section {
    type: string;
    questions: Question[];
    options: string[];
    isOpen: boolean;
}

export interface Paragraph {
    title: string;
    content: string;
    sections: Section[];
    isOpen: boolean;
}


const ReadingRender: React.FC = () => {
    const [paragraphs, setParagraphs] = useState<Paragraph[]>([
        { 
            title: '', 
            content: '', 
            sections: [{ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true }], 
            isOpen: true 
        }
    ]);;

    const [problemName, setProblemName] = useState('');
    const [accessUser, setAccessUser] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [newOption, setNewOption] = useState('');
    const [globalOptions, setGlobalOptions] = useState<string[]>([]);

    const handleAddGlobalOption = (pIndex: number, sIndex: number) => {
        if (newOption.trim() !== '') {
            const updatedParagraphs = [...paragraphs];
            updatedParagraphs[pIndex].sections[sIndex].options.push(newOption.trim());
            setParagraphs(updatedParagraphs);
            setGlobalOptions([...globalOptions, newOption.trim()]);
            setNewOption(''); // Clear the input after adding
        }
    };
    // const handleDeleteGlobalOption = (optIndex: number) => {
    //     setGlobalOptions(globalOptions.filter((_, index) => index !== optIndex));
    // };

    const handleDeleteGlobalOption = (optIndex: number) => {
        const optionToDelete = globalOptions[optIndex];
        
        // Remove the option from globalOptions
        const updatedGlobalOptions = globalOptions.filter((_, index) => index !== optIndex);
        setGlobalOptions(updatedGlobalOptions);
        
        // Remove the option from each section's options array
        const updatedParagraphs = paragraphs.map(paragraph => {
            const updatedSections = paragraph.sections.map(section => ({
                ...section,
                options: section.options.filter(option => option !== optionToDelete),
            }));
            return {
                ...paragraph,
                sections: updatedSections,
            };
        });
    
        setParagraphs(updatedParagraphs);
    };

    const questionTypes = [
        "Choose a question type",
        "Yes/No/Not given",
        "True/False/Not Given",
        "Fill in the blank with one word only",
        "Fill in the blank with no more than two words",
        "Matching Heading",
        "Matching Paragraph Information",
        "Matching Features",
        "Matching Sentence Endings",
        "Multiple Choice",
    ];

    const toggleParagraph = (index: number) => {
        setParagraphs(paragraphs.map((para, i) => i === index ? { ...para, isOpen: !para.isOpen } : para));
    };

    const toggleSection = (pIndex: number, sIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].isOpen = !newParagraphs[pIndex].sections[sIndex].isOpen;
        setParagraphs(newParagraphs);
    };

    const handleInputChange = (pIndex: number, field: 'title' | 'content', value: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex][field] = value;
        setParagraphs(newParagraphs);
    };

    const handleSectionChange = (pIndex: number, sIndex: number, value: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].type = value;
        setParagraphs(newParagraphs);
    };

    const handleQuestionChange = (pIndex: number, sIndex: number, qIndex: number, value: string, field: 'question' | 'answer' | 'explanation' | 'options') => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].questions[qIndex][field] = value;
        setParagraphs(newParagraphs);
    };

    const addParagraph = () => {
        setParagraphs([...paragraphs, { title: '', content: '', sections: [{ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true }], isOpen: true }]);
    };

    const addSection = (pIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections.push({ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options:'' }], isOpen: true });
        setParagraphs(newParagraphs);
    };

    const addQuestion = (pIndex: number, sIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].questions.push({ question: '', answer: '', explanation: '', options:'' });
        setParagraphs(newParagraphs);
    };

    const deleteParagraph = (pIndex: number) => {
        setParagraphs(paragraphs.filter((_, i) => i !== pIndex));
    };

    const deleteSection = (pIndex: number, sIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections = newParagraphs[pIndex].sections.filter((_, i) => i !== sIndex);
        setParagraphs(newParagraphs);
    };

    const deleteQuestion = (pIndex: number, sIndex: number, qIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].questions = newParagraphs[pIndex].sections[sIndex].questions.filter((_, i) => i !== qIndex);
        setParagraphs(newParagraphs);
    };

    const handleAccessUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Automatically add a space after each comma if not already present
        value = value.replace(/,\s*/g, ', ');

        setAccessUser(value);
    };

    const handleGeneratePara = (pIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingParagraph`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            // Update the paragraph with the API response data
            const updatedParagraphs = paragraphs.map((para, index) => 
                index === pIndex ? { ...para, title: response.data.title, content: response.data.content } : para
            );
            setParagraphs(updatedParagraphs);
        })
        .catch(error => console.error('Error:', error));
    };


    const createProblem = () => {
        console.log(problemName);
        console.log(paragraphs);
        fetch('/create_problem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paragraphs,
                problemName,
                accessUser,
                startTime,
                endTime
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    };

    const renderParagraphs = () => (
        <div className='py-4'>
            <input 
                type="text" 
                placeholder='Name' 
                className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                onChange={(e) => setProblemName(e.target.value)}
                // value={paragraph.title} 
                // onChange={(e) => handleInputChange(pIndex, 'title', e.target.value)}
            />
            <input 
                type="text" 
                placeholder='Access User (comma separated, blank for public access)' 
                className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                value={accessUser}
                onChange={handleAccessUserChange}
            />
            <div className='flex space-x-4'>
                <input 
                    type="datetime-local" 
                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <input 
                    type="datetime-local" 
                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>

            {paragraphs.map((paragraph, pIndex) => (
                <div key={pIndex} className="border border-gray-300 rounded-md p-4 mb-4">
                    <div onClick={() => toggleParagraph(pIndex)} className="cursor-pointer flex justify-between items-center">
                        <h4>{`Paragraph ${pIndex + 1}`}</h4>
                        <div>
                            <span>{paragraph.isOpen ? '-' : '+'}</span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteParagraph(pIndex);
                                }} 
                                className="px-2 rounded-md ml-2"
                            >
                                x
                            </button>
                        </div>
                    </div>
                    {paragraph.isOpen && (
                        <div>
                            <div className='flex'>
                                <input 
                                    type="text" 
                                    placeholder='Title / Topic' 
                                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                                    value={paragraph.title} 
                                    onChange={(e) => handleInputChange(pIndex, 'title', e.target.value)}
                                />
                                <button 
                                    onClick={() => handleGeneratePara(pIndex, paragraph.title, paragraph.content)}
                                    // onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                    className="px-2 rounded-md ml-2"
                                >
                                    Generate
                                </button>
                            </div>
        
                            <textarea 
                                placeholder='Content' 
                                className="border border-gray-300 px-4 py-2 rounded-md w-full h-64 my-2" 
                                value={paragraph.content} 
                                onChange={(e) => handleInputChange(pIndex, 'content', e.target.value)}
                            ></textarea>
                            {paragraph.sections.map((section, sIndex) => (
                                <div key={sIndex} className="border border-gray-300 rounded-md p-4 mb-4">
                                    <div onClick={() => toggleSection(pIndex, sIndex)} className="cursor-pointer flex justify-between items-center">
                                        <h4>{`Section ${sIndex + 1}`}</h4>
                                        <div>
                                            <span>{section.isOpen ? '-' : '+'}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSection(pIndex, sIndex);
                                                }} 
                                                className=" px-2 rounded-md ml-2"
                                            >
                                                x
                                            </button>
                                        </div>
                                    </div>
                                    {section.isOpen && (
                                        <div>
                                            <div className='flex'>
                                                <select 
                                                    className="border border-gray-300 px-3 py-2 rounded-md w-full my-2" 
                                                    value={section.type} 
                                                    onChange={(e) => handleSectionChange(pIndex, sIndex, e.target.value)}
                                                >
                                                    {questionTypes.map((type, i) => (
                                                        <option key={i} value={type}>{type}</option>
                                                    ))}
                                                </select>

                                                <button 
                                                    // onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                                    className="px-2 rounded-md ml-2"
                                                >
                                                    Generate
                                                </button>
                                            </div>

                                            {section.type === 'Matching Heading' || section.type === 'Matching Paragraph Information' || section.type === 'Matching Features' || section.type === 'Matching Sentence Endings' ? (
                                                <>
                                                    <div className="my-4 flex">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Add new option" 
                                                            className="border border-gray-300 px-4 py-2 rounded-md w-full mb-2"
                                                            value={newOption}
                                                            onChange={(e) => setNewOption(e.target.value)}
                                                        />
                                                        <button 
                                                            onClick={() => handleAddGlobalOption(pIndex,sIndex)} 
                                                            className=" rounded-md px-3"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>

                                                    <div className="my-4">
                                                        {globalOptions.map((option, optIndex) => (
                                                            <div key={optIndex} className="flex items-center mb-2">
                                                                <input 
                                                                    type="text" 
                                                                    className="border border-gray-300 px-4 py-2 rounded-md w-full ml-2" 
                                                                    value={option} 
                                                                    readOnly
                                                                />
                                                                <button 
                                                                    onClick={() => handleDeleteGlobalOption(optIndex)} 
                                                                    className="px-2 rounded-md ml-2 text-red-500"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ):(
                                                <></>
                                            )}
                                            
                                            {section.questions.map((q, qIndex) => (
                                                <div key={qIndex} className="my-2">
                                                    {section.type === 'Yes/No/Not given' || section.type === 'True/False/Not Given' ? (
                                                        <>
                                                        <div className="flex items-center">
                                                            <input 
                                                                type="text" 
                                                                placeholder={`Question ${qIndex + 1}`} 
                                                                className="border border-gray-300 px-4 py-2 rounded-md w-full mr-2" 
                                                                value={q.question} 
                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'question')}
                                                            />
                                                    
                                                            <div className="flex justify-center items-center w-1/2 space-x-4">
                                                                {section.type === 'Yes/No/Not given' ? (
                                                                    <>
                                                                        <label className="flex items-center space-x-1">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`answer-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value="Yes"
                                                                                checked={q.answer === 'Yes'}
                                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center space-x-1">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`answer-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value="No"
                                                                                checked={q.answer === 'No'}
                                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                        <label className="flex items-center space-x-1">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`answer-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value="Not Given"
                                                                                checked={q.answer === 'Not Given'}
                                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                            />
                                                                            <span>NG</span>
                                                                        </label>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <label className="flex items-center space-x-1">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`answer-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value="True"
                                                                                checked={q.answer === 'True'}
                                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                            />
                                                                            <span>True</span>
                                                                        </label>
                                                                        <label className="flex items-center space-x-1">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`answer-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value="False"
                                                                                checked={q.answer === 'False'}
                                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                            />
                                                                            <span>False</span>
                                                                        </label>
                                                                        <label className="flex items-center space-x-1">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`answer-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value="Not Given"
                                                                                checked={q.answer === 'Not Given'}
                                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                            />
                                                                            <span>NG</span>
                                                                        </label>
                                                                    </>
                                                                )}
                                                            </div>
                                                    
                                                            <button 
                                                                onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                                                className="px-2 rounded-md ml-2 text-red-600"
                                                            >
                                                                x
                                                            </button>
                                                        </div>
                                                    </>
                                                    
                                                    ) : section.type === 'Matching Heading' || section.type === 'Matching Paragraph Information' || section.type === 'Matching Features' || section.type === 'Matching Sentence Endings' ? (
                                                        <>
                                                            <div className='flex'>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder={`Question ${qIndex + 1}`} 
                                                                    className="border border-gray-300 px-4 py-2 rounded-md w-full mr-2" 
                                                                    value={q.question} 
                                                                    onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'question')}
                                                                />
                                                                <select 
                                                                    className="border border-gray-300 px-4 py-2 rounded-md w-full" 
                                                                    value={q.answer}
                                                                    onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                >
                                                                    <option value="">Select an option</option>
                                                                    {section.options.map((option, optIndex) => (
                                                                        <option key={optIndex} value={option}>{option}</option>
                                                                    ))}
                                                                </select>
                                                                <button 
                                                                    onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                                                    className="px-2 rounded-md ml-2 text-red-600"
                                                                >
                                                                    x
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : section.type === 'Multiple Choice' ? (
                                                        <div>
                                                            <div className='flex'>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder={`Question ${qIndex + 1}`} 
                                                                    className="border border-gray-300 px-4 py-2 rounded-md w-full mb-2" 
                                                                    value={q.question} 
                                                                    onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'question')}
                                                                />
                                                                <button 
                                                                        onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                                                        className="px-2 rounded-md ml-2"
                                                                    >
                                                                        x
                                                                </button>
                                                            </div>
                                                    
                                                            <div>
                                                                {q.options.split(',').map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex items-center mb-2">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`options-${pIndex}-${sIndex}-${qIndex}`} 
                                                                            value={option}
                                                                            checked={q.answer === option}
                                                                            onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                                        />
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder={`Option ${optIndex + 1}`} 
                                                                            className="border border-gray-300 px-4 py-2 rounded-md w-full ml-2" 
                                                                            value={option} 
                                                                            onChange={(e) => {
                                                                                const updatedOptions = q.options.split(',');
                                                                                updatedOptions[optIndex] = e.target.value;
                                                                                handleQuestionChange(pIndex, sIndex, qIndex, updatedOptions.join(','), 'options');
                                                                            }}
                                                                        />
                                                                        <button 
                                                                            onClick={() => {
                                                                                const updatedOptions = q.options.split(',');
                                                                                updatedOptions.splice(optIndex, 1); // Remove the option at the current index
                                                                                handleQuestionChange(pIndex, sIndex, qIndex, updatedOptions.join(','), 'options');
                                                                            }} 
                                                                            className="px-2 rounded-md ml-2 text-red-500"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button 
                                                                    onClick={() => {
                                                                        const updatedOptions = q.options.split(',');
                                                                        updatedOptions.push('');
                                                                        handleQuestionChange(pIndex, sIndex, qIndex, updatedOptions.join(','), 'options');
                                                                    }} 
                                                                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='flex'>
                                                            <input 
                                                                type="text" 
                                                                placeholder={`Question ${qIndex + 1}`} 
                                                                className="border border-gray-300 px-4 py-2 rounded-md w-full mr-2" 
                                                                value={q.question} 
                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'question')}
                                                            />
                                                            <input 
                                                                type="text" 
                                                                placeholder="Answer" 
                                                                className="border border-gray-300 px-4 py-2 rounded-md w-full" 
                                                                value={q.answer} 
                                                                onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                            />
                                                        </div>
                                                    )}
                                                    <textarea 
                                                        placeholder='Explanation' 
                                                        className="border border-gray-300 px-4 py-2 rounded-md w-full my-2 h-20"
                                                        value={q.explanation}
                                                        onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'explanation')}
                                                    ></textarea>
                                                </div>
                                            ))}

                                            <button 
                                                onClick={() => addQuestion(pIndex, sIndex)} 
                                                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button 
                                onClick={() => addSection(pIndex)} 
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button 
                onClick={addParagraph} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
                +
            </button>
            <br />
            <button 
                onClick={createProblem} 
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
            >
                Create Problem
            </button>
        </div>
    );

    return renderParagraphs();
};

export default ReadingRender;
