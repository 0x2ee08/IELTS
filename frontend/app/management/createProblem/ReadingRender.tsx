// ReadingRender.tsx
'use client';

import React, { useState } from 'react';

export interface Question {
    question: string;
    answer: string;
    explanation: string;
}

export interface Section {
    type: string;
    questions: Question[];
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
            sections: [{ type: '', questions: [{ question: '', answer: '', explanation: '' }], isOpen: true }], 
            isOpen: true 
        }
    ]);

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
        "Choose a Title"
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

    const handleQuestionChange = (pIndex: number, sIndex: number, qIndex: number, value: string, field: 'question' | 'answer' | 'explanation') => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].questions[qIndex][field] = value;
        setParagraphs(newParagraphs);
    };

    const addParagraph = () => {
        setParagraphs([...paragraphs, { title: '', content: '', sections: [{ type: '', questions: [{ question: '', answer: '', explanation: '' }], isOpen: true }], isOpen: true }]);
    };

    const addSection = (pIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections.push({ type: '', questions: [{ question: '', answer: '', explanation: '' }], isOpen: true });
        setParagraphs(newParagraphs);
    };

    const addQuestion = (pIndex: number, sIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].questions.push({ question: '', answer: '', explanation: '' });
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

    const createProblem = () => {
        console.log(paragraphs);
        fetch('/create_problem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paragraphs),
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    };

    const renderParagraphs = () => (
        <div className='py-4'>
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
                                className="bg-red-500 text-white px-2 py-1 rounded-md ml-2"
                            >
                                Delete Paragraph
                            </button>
                        </div>
                    </div>
                    {paragraph.isOpen && (
                        <div>
                            <input 
                                type="text" 
                                placeholder='Title' 
                                className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                                value={paragraph.title} 
                                onChange={(e) => handleInputChange(pIndex, 'title', e.target.value)}
                            />
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
                                                className="bg-red-500 text-white px-2 py-1 rounded-md ml-2"
                                            >
                                                Delete Section
                                            </button>
                                        </div>
                                    </div>
                                    {section.isOpen && (
                                        <div>
                                            <select 
                                                className="border border-gray-300 px-3 py-2 rounded-md w-full my-2" 
                                                value={section.type} 
                                                onChange={(e) => handleSectionChange(pIndex, sIndex, e.target.value)}
                                            >
                                                {questionTypes.map((type, i) => (
                                                    <option key={i} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {section.questions.map((q, qIndex) => (
                                                <div key={qIndex} className="my-2">
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Question ${qIndex + 1}`} 
                                                            className="border border-gray-300 px-4 py-2 rounded-md w-full mr-2" 
                                                            value={q.question} 
                                                            onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'question')}
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder='Answer' 
                                                            className="border border-gray-300 px-4 py-2 rounded-md w-full" 
                                                            value={q.answer} 
                                                            onChange={(e) => handleQuestionChange(pIndex, sIndex, qIndex, e.target.value, 'answer')}
                                                        />
                                                        <button 
                                                            onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                                            className="bg-red-500 text-white px-2 py-1 rounded-md ml-2"
                                                        >
                                                            Delete Question
                                                        </button>
                                                    </div>
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
                                                Add Question
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button 
                                onClick={() => addSection(pIndex)} 
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                            >
                                Add Section
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button 
                onClick={addParagraph} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
                Add Paragraph
            </button>

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
