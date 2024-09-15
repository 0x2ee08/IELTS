'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Reading.css';

const ReadingContest = ({ contest }: { contest: any }) => {
    const [activeParagraph, setActiveParagraph] = useState(0);
    const [userAnswers, setUserAnswers] = useState<any>(() => {
        // Try to get stored answers from the cookie when the component mounts
        const savedAnswers = Cookies.get('readingContestAnswers');
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    });
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    // Update window height dynamically on resize
    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save updated answers to cookie every time user updates the answer
    const saveAnswersToCookie = (updatedAnswers: any) => {
        Cookies.set('readingContestAnswers', JSON.stringify(updatedAnswers), { expires: 7 });
    };

    const handleParagraphSwitch = (index: number) => {
        setActiveParagraph(index);
    };

    const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: string) => {
        const updatedAnswers = { ...userAnswers };
        if (!updatedAnswers[activeParagraph]) updatedAnswers[activeParagraph] = {};
        if (!updatedAnswers[activeParagraph][sectionIndex]) updatedAnswers[activeParagraph][sectionIndex] = {};
        updatedAnswers[activeParagraph][sectionIndex][questionIndex] = value;
        setUserAnswers(updatedAnswers);
        saveAnswersToCookie(updatedAnswers); // Save answers to cookie after updating state
    };

    const handleSubmit = () => {
        saveAnswersToCookie(userAnswers); // Ensure the latest answers are saved
        alert('Your answers have been saved.');
    };

    const renderTrueFalseNotGiven = (sectionIndex: number, questionIndex: number) => (
        ['True', 'False', 'Not Given'].map((option: string) => (
            <label key={option}>
                <input
                    type="radio"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] === option}
                    onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
                /> {option}
            </label>
        ))
    );

    const renderYesNoNotGiven = (sectionIndex: number, questionIndex: number) => (
        ['Yes', 'No', 'Not Given'].map((option: string) => (
            <label key={option}>
                <input
                    type="radio"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] === option}
                    onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
                /> {option}
            </label>
        ))
    );
    
    const renderFillInTheBlank = (sectionIndex: number, questionIndex: number) => (
        <input
            type="text"
            placeholder="Answer"
            value={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || ''}
            onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
        />
    );
    
    const renderMatchingType = (sectionIndex: number, questionIndex: number, section: any) => (
        <select 
            value={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || ''}
            onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}>
            {section.options.map((option: string, oIndex: number) => (
                <option key={oIndex} value={option}>{option}</option>
            ))}
        </select>
    );
    
    const renderMultipleChoiceOneAnswer = (sectionIndex: number, questionIndex: number, section: any) => (
        section.questions[questionIndex].options.split(',').map((option: string) => (
            <label key={option.trim()}>
                <input
                    type="radio"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option.trim()}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] === option.trim()}
                    onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
                /> {option.trim()}
            </label>
        ))
    );
    
    const renderMultipleChoiceMultipleAnswer = (sectionIndex: number, questionIndex: number, section: any) => (
        section.questions[questionIndex].options.split(',').map((option: string) => (
            <label key={option.trim()}>
                <input
                    type="checkbox"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option.trim()}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex]?.includes(option.trim())}
                    onChange={(e) => {
                        const updatedValue = userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || [];
                        const newValue = updatedValue.includes(option.trim()) 
                            ? updatedValue.filter((opt: string) => opt !== option.trim())
                            : [...updatedValue, option.trim()];
                        handleAnswerChange(sectionIndex, questionIndex, newValue);
                    }}
                /> {option.trim()}
            </label>
        ))
    );    
    let cnt=0;
    return (
        <div className="reading-contest-page">
            <h1>{contest.problemName}</h1>
            <p>Start Time: {new Date(contest.startTime).toLocaleString()}</p>
            <p>End Time: {new Date(contest.endTime).toLocaleString()}</p>

            <div>
                {contest.paragraphs.map((paragraph: any, index: number) => (
                    <button key={index} onClick={() => handleParagraphSwitch(index)}>
                        Paragraph {index + 1}
                    </button>
                ))}
            </div>

            <div className="contest-layout" style={{ height: `${windowHeight - 150}px` }}>
                <div className="paragraph-content">
                    <h2>{contest.paragraphs[activeParagraph].title}</h2>
                    <p>
                        {contest.paragraphs[activeParagraph].content.split('\n\n').map((text: string, index: number) => (
                            <span key={index}>
                                {text}
                                <br /><br />
                            </span>
                        ))}
                    </p>
                </div>


                <div className="sections-content">
                    {contest.paragraphs[activeParagraph].sections.map((section: any, secIndex: number) => (
                        <div key={secIndex}>
                            <h3>Section Type: {section.type}</h3> 
                            {section.questions.map((question: any, qIndex: number) => (
                                <div key={qIndex}>
                                    <p><b>Question {++cnt}:</b> {question.question}</p>

                                    {section.type === 'True/False/Not Given' && renderTrueFalseNotGiven(secIndex, qIndex)}
                                    {section.type === 'Yes/No/Not Given' && renderYesNoNotGiven(secIndex, qIndex)}
                                    {section.type === 'Fill in the blank with one word' && renderFillInTheBlank(secIndex, qIndex)}
                                    {section.type === 'Fill in the blank with no more than two words' && renderFillInTheBlank(secIndex, qIndex)}
                                    {section.type === 'Matching Heading' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Matching Paragraph Information' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Matching Features' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Matching Sentence Endings' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Multiple Choice One Answer' && renderMultipleChoiceOneAnswer(secIndex, qIndex, section)}
                                    {section.type === 'Multiple Choice Multiple Answer' && renderMultipleChoiceMultipleAnswer(secIndex, qIndex, section)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={handleSubmit}>Submit Answers</button>
        </div>
    );
};

export default ReadingContest;
