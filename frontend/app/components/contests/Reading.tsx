'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ReadingContest = ({ contest }: { contest: any }) => {
    const [activeParagraph, setActiveParagraph] = useState(0);
    const [userAnswers, setUserAnswers] = useState<any>({});
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    // Update window height dynamically on resize
    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);

        // Clean up the event listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleParagraphSwitch = (index: number) => {
        setActiveParagraph(index);
    };

    const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: string) => {
        const updatedAnswers = { ...userAnswers };
        if (!updatedAnswers[activeParagraph]) updatedAnswers[activeParagraph] = {};
        if (!updatedAnswers[activeParagraph][sectionIndex]) updatedAnswers[activeParagraph][sectionIndex] = {};
        updatedAnswers[activeParagraph][sectionIndex][questionIndex] = value;
        setUserAnswers(updatedAnswers);
    };

    const handleSubmit = () => {
        Cookies.set('readingContestAnswers', JSON.stringify(userAnswers));
        alert('Your answers have been saved.');
    };

    return (
        <div>
            <h1>{contest.problemName}</h1>
            <p>Start Time: {new Date(contest.startTime).toLocaleString()}</p>
            <p>End Time: {new Date(contest.endTime).toLocaleString()}</p>

            {/* Paragraph Switching Buttons */}
            <div>
                {contest.paragraphs.map((paragraph: any, index: number) => (
                    <button key={index} onClick={() => handleParagraphSwitch(index)}>
                        Paragraph {index + 1}
                    </button>
                ))}
            </div>

            {/* Display Active Paragraph and Sections Side by Side */}
            <div style={{ display: 'flex', gap: '20px', height: `${windowHeight - 150}px` }}>
                
                {/* Left Column: Paragraph Content */}
                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                    <h2>{contest.paragraphs[activeParagraph].title}</h2>
                    <p>{contest.paragraphs[activeParagraph].content}</p>
                </div>

                {/* Right Column: Sections and Questions */}
                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                    {contest.paragraphs[activeParagraph].sections.map((section: any, secIndex: number) => (
                        <div key={secIndex}>
                            <h3>Section Type: {section.type}</h3>
                            {section.questions.map((question: any, qIndex: number) => (
                                <div key={qIndex}>
                                    <p><b>Question:</b> {question.question}</p>

                                    {/* True/False/Not Given */}
                                    {section.type === 'True/False/Not Given' && (
                                        <div>
                                            {['True', 'False', 'Not Given'].map((option) => (
                                                <label key={option}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${secIndex}-${qIndex}`}
                                                        value={option}
                                                        onChange={(e) => handleAnswerChange(secIndex, qIndex, e.target.value)}
                                                    /> {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* Fill in the blank with one word */}
                                    {section.type === 'Fill in the blank with one word' && (
                                        <input
                                            type="text"
                                            placeholder="Enter one word"
                                            onChange={(e) => handleAnswerChange(secIndex, qIndex, e.target.value)}
                                        />
                                    )}

                                    {/* Matching Heading */}
                                    {section.type === 'Matching Heading' && (
                                        <select onChange={(e) => handleAnswerChange(secIndex, qIndex, e.target.value)}>
                                            {section.options.map((option: string, oIndex: number) => (
                                                <option key={oIndex} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Multiple Choice (One Answer) */}
                                    {section.type === 'Multiple Choice One Answer' && (
                                        <div>
                                            {section.options.map((option: string) => (
                                                <label key={option}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${secIndex}-${qIndex}`}
                                                        value={option}
                                                        onChange={(e) => handleAnswerChange(secIndex, qIndex, e.target.value)}
                                                    /> {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* Multiple Choice (Multiple Answers) */}
                                    {section.type === 'Multiple Choice Multiple Answer' && (
                                        <div>
                                            {section.options.map((option: string) => (
                                                <label key={option}>
                                                    <input
                                                        type="checkbox"
                                                        name={`question-${secIndex}-${qIndex}`}
                                                        value={option}
                                                        onChange={(e) => handleAnswerChange(secIndex, qIndex, e.target.value)}
                                                    /> {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit}>Submit Answers</button>
        </div>
    );
};

export default ReadingContest;
