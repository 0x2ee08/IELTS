'use client';

import React, { useState } from 'react';

const YOUR_API_KEY = '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';

const WritingPage: React.FC = () => {
    const [userInput, setUserInput] = useState('');
    const [checkedText, setCheckedText] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [statement, setStatement] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isTextAreaVisible, setTextAreaVisible] = useState(false);

    const handleInputStatement = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStatement(e.target.value)
    }

    const handleSubmitStatement = async() => {
        setTextAreaVisible(true)
    }

    const handleCheckAndCorrectGrammar = async (userInput: string, apiKey: string) => {
        console.log(userInput);
    
        try {
            // Step 1: Request grammar correction from the API, with additional categories
            const correctionMessage = `
            Correct my essay by generating an essay that follows these properties:\n
            - Check word choice, word formation, expression, preposition, grammar, and incorrect information.\n
            - If the word is wrong in any category, format it as (wrong_word)[correct_word].\n
            - Use this format: (wrong_word)[correct_word]{category_of_error}\n
            - For example: a (b)[correct_b]{word choice} (c)[correct_c]{grammar}.\n\n
            Here is my essay:
            \n\n
            ${userInput}
            \n\n
            (NO ADDITIONAL TEXT OR ENDLINE, JUST THE ESSAY ONLY), NO YAPPING
            `;
    
            const correctionRequest = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "model": "openai/gpt-4o",
                    "messages": [
                        {
                            "role": "user",
                            "content": correctionMessage,
                        },
                    ],
                }),
            });
    
            if (!correctionRequest.ok) {
                const err = await correctionRequest.json();
                throw new Error(`HTTP error! Status: ${correctionRequest.status}, Message: ${err.message}`);
            }
    
            const correctionData = await correctionRequest.json();
            const correctedText = correctionData.choices[0]?.message?.content || 'No content available';
    
            console.log("Corrected Text:", correctedText);
    
            // Step 2: Highlight errors without changing original user input
            const formatCorrections = (original: string, corrected: string) => {
                // Regex to detect patterns like (wrong text) [correction text]{category}
                const regex = /\(([^)]+)\)\s?\[([^\]]+)\]\{([^\}]+)\}/g;
                let match;
    
                // We'll keep the original text untouched and only highlight the wrong parts
                let formattedText = original;
    
                // Find the matches in the corrected text
                while ((match = regex.exec(corrected)) !== null) {
                    const [fullMatch, wrongPhrase, correctPhrase, errorCategory] = match;
    
                    // Create a regular expression to match the wrong phrase in the original text
                    const wrongRegex = new RegExp(`\\b${wrongPhrase}\\b`, 'g');
                    
                    // Replace it with a span that highlights the error and shows the correction and category in a tooltip
                    formattedText = formattedText.replace(wrongRegex, (match) => 
                        `<span class="error" title="Correction: ${correctPhrase}, Type: ${errorCategory}">${match}</span>`
                    );
                }
    
                return formattedText;
            };
    
            // Format the corrected text while keeping the original input intact
            const formattedText = formatCorrections(userInput, correctedText);
    
            // Set the formatted text to display in the UI
            setCheckedText(formattedText);
    
        } catch (error) {
            // Handle the unknown error type
            if (error instanceof Error) {
                console.error('Error:', error.message);
                setError(`An error occurred: ${error.message}`);
            } else {
                console.error('Unknown error:', error);
                setError('An unknown error occurred.');
            }
        }
    };
    
    
    
    const handleFeedback = async (userInput: string, statement: string, apiKey: string) => {
        try {
            const feedbackMessage = `
            Grade the following essay as an IELTS Writing Task 2 with criteria based on: Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy. Provide feedback in each of these categories and give an overall band score out of 9.
    
            Statement: "${statement}"
            Essay: "${userInput}"
    
            Provide a detailed breakdown of the strengths and weaknesses in each category and suggest improvements where necessary.
            `;
    
            const feedbackRequest = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "model": "openai/gpt-4o",
                    "messages": [
                        {
                            "role": "user",
                            "content": feedbackMessage,
                        },
                    ],
                }),
            });
    
            if (!feedbackRequest.ok) {
                const err = await feedbackRequest.json();
                throw new Error(`HTTP error! Status: ${feedbackRequest.status}, Message: ${err.message}`);
            }
    
            const feedbackData = await feedbackRequest.json();
            let feedbackContent = feedbackData.choices[0]?.message?.content || 'No feedback available';
    
            // Step 1: Replace `**bold**` markdown with HTML <strong> tags
            feedbackContent = feedbackContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
            // Step 2: Format the response with line breaks for better readability
            feedbackContent = feedbackContent
                .replace(/Task Response:/g, '<br/><strong>Task Response:</strong>')
                .replace(/Coherence and Cohesion:/g, '<br/><strong>Coherence and Cohesion:</strong>')
                .replace(/Lexical Resource:/g, '<br/><strong>Lexical Resource:</strong>')
                .replace(/Grammatical Range and Accuracy:/g, '<br/><strong>Grammatical Range and Accuracy:</strong>')
                .replace(/Overall Band:/g, '<br/><strong>Overall Band:</strong>');
    
            setFeedback(feedbackContent);
            setError('');
    
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message);
                setError(`An error occurred: ${error.message}`);
            } else {
                console.error('Unknown error:', error);
                setError('An unknown error occurred.');
            }
        }
    };    

    const handleCheckGrammarAndSubmit = async() => {
        handleCheckAndCorrectGrammar(userInput, YOUR_API_KEY)
        handleFeedback(userInput, statement, YOUR_API_KEY)
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100vw', height: '100vh', margin: '0', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            {!isTextAreaVisible && (
                <div>
                    <input
                        type="text"
                        value={statement}
                        onChange={handleInputStatement}
                        placeholder="Your statement here"
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <button
                        onClick={handleSubmitStatement}
                    >
                        Start
                    </button>
                </div>
            )}

            {isTextAreaVisible && (
                <>
                    <div style={{ width: '100%', marginBottom: '20px' }}>
                        <h3>Statement:</h3>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                            {statement}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '100%', height: 'calc(100vh - 200px)', marginBottom: '20px' }}>
                        <textarea
                            rows={10}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Enter your essay here..."
                            style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px', marginRight: '20px', backgroundColor: '#f9f9f9', outline: 'none', resize: 'vertical' }}
                        />
                        <div
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px', backgroundColor: '#f9f9f9', overflowY: 'auto', maxHeight: '300px' }}
                        >
                            {checkedText && (
                                <div
                                    dangerouslySetInnerHTML={{ __html: checkedText }}
                                    style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', whiteSpace: 'pre-wrap' }}
                                />
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleCheckGrammarAndSubmit}
                        style={{ backgroundColor: '#4CAF50', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%', fontSize: '16px', marginTop: '20px' }}
                    >
                        Submit
                    </button>
                    {feedback && (
                        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <h3>Feedback:</h3>
                            <div
                                dangerouslySetInnerHTML={{ __html: feedback }}
                                style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', whiteSpace: 'pre-wrap' }}
                            />
                        </div>
                    )}
                </>
            )}
            <div style={{ width: '100%' }}>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            </div>
            
            <style>{`
                .error {
                    text-decoration: underline red wavy;
                    position: relative;
                    cursor: pointer;
                    color: #e74c3c;
                }
                .error::after {
                    content: attr(data-suggestion);
                    position: absolute;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    padding: 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #333;
                    top: 0;
                    left: -200%;
                    white-space: nowrap;
                    z-index: 10;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: none;
                    transform: translateX(-100%);
                }
                .error:hover::after {
                    display: block;
                }
            `}</style>
        </div>
    );
};

export default WritingPage;
