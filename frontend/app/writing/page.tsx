'use client'

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

type TopicData = {
    topic: string;
    statements: string[];
};
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
    vocabularyIsOpen: boolean;
}
const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [topics, setTopics] = useState<TopicData[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState('Reading');

    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(event.target.value);
        setFile(null); // Reset file when changing type
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };
    
    const extractStatements = async () => {
        const token = localStorage.getItem('token');
    
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            setLoading(true);
            setError('');
    
            const response = await axios.post(
                `${config.API_BASE_URL}api/import_file_writing_statements`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
    
            const result = response.data.topics;
            setTopics(result);  // Assuming `result` is an array of topics with statements
        } catch (err) {
            console.error('Error extracting topics and statements:', err);
            setError('An error occurred while extracting the topics and statements.');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };
    
    const uploadStatementsWriting = async () => {
        const token = localStorage.getItem('token');
    
        if (!topics || topics.length === 0) return;  // Ensure topics are available
    
        try {
            for (const topic of topics) {
                for (const statement of topic.statements) {  // Assuming each topic has a `statements` array
                    await axios.post(
                        `${config.API_BASE_URL}api/upload_file_writing_statements`,
                        { topic: topic.topic, statement: statement },  // Upload each statement individually
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                }
            }
            console.log('All topics and statements uploaded successfully.');
        } catch (error) {
            console.error('Error uploading topics and statements:', error);
            setError('An error occurred while uploading topics and statements.');
        }
    };
    
    const uploadingProblemsWriting = async () => {
        await extractStatements();
        await uploadStatementsWriting();
    };
    const emptyParagraph = {
        title: '', 
        content: '', 
        sections: [{ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true }], 
        isOpen: true,
        vocabularyIsOpen: false
    }
    const [paragraph, setParagraph] = useState<Paragraph> (emptyParagraph)

    const handleGenerateParagraph = async(statement: string) => {
        const token = localStorage.getItem('token');
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingParagraphForStatement`, 
            { statement },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            // Update the paragraph with the API response data
            setParagraph(prevParagraph => ({
                ...prevParagraph,
                title: response.data.title,
                content: response.data.content
            }));
            
        })
        .catch(error => alert(error.response.data.error))
    };

    const questionTypes = [
        "Yes/No/Not Given",
        "True/False/Not Given",
        "Fill in the blank with one word only",
        "Fill in the blank with no more than two words",
        "Matching Heading",
        "Matching Paragraph Information",
        "Matching Features",
        "Matching Sentence Endings",
        "Multiple Choice One Answer",
        "Multiple Choice Multiple Answer"
    ];

    const handleGenerateYNNQuestion = (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
        
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingYNN`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                // Ensure there is a question entry for this index
                if (!updatedParagraph.sections[sIndex].questions[qIndex]) {
                    updatedParagraph.sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                updatedParagraph.sections[sIndex].questions[qIndex].question = questionData.question;
                updatedParagraph.sections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedParagraph.sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });

            // Update the state with the new questions
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };

    const handleGenerateTFNQuestion = (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
        
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingTFNG`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                // Ensure there is a question entry for this index
                if (!updatedParagraph.sections[sIndex].questions[qIndex]) {
                    updatedParagraph.sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                updatedParagraph.sections[sIndex].questions[qIndex].question = questionData.question;
                updatedParagraph.sections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedParagraph.sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });

            // Update the state with the new questions
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };

    const handleGenerateFillOneWordQuestion = (sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');

        
    
        axios.post(`${config.API_BASE_URL}api/generateReadingFillOneWord`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                if (!updatedParagraph.sections[sIndex].questions[qIndex]) {
                    updatedParagraph.sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                updatedParagraph.sections[sIndex].questions[qIndex].question = questionData.question;
                updatedParagraph.sections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedParagraph.sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });
    
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    

    const handleGenerateFillTwoWordQuestion = (sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');

        
    
        axios.post(`${config.API_BASE_URL}api/generateReadingFillTwoWords`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                if (!updatedParagraph.sections[sIndex].questions[qIndex]) {
                    updatedParagraph.sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                updatedParagraph.sections[sIndex].questions[qIndex].question = questionData.question;
                updatedParagraph.sections[sIndex].questions[qIndex].answer = questionData.answer.trim()                       // Removes space from the beginning and end of the string
                .replace(/,\s+/g, ',');
                updatedParagraph.sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });
    
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    

    const handleGenerateMatchingHeadingQuestion = (sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');
        
        axios.post(
            `${config.API_BASE_URL}api/generateReadingMatchingHeading`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
    
            // Iterate over the keys in the response data (e.g., "1", "2", etc.)
            Object.keys(data).forEach((key, qIndex) => {
                if (key !== "options") { // Skip the "options" key
                    const questionData = data[key];
    
                    // Update the corresponding question in the state
                    const newQuestion: Question = {
                        question: questionData.question,
                        answer: questionData.answer,
                        explanation: questionData.explanation,
                        options: ''  // This field might not be needed if options are handled differently
                    };
    
                    // Update the section with the new question
                    updatedParagraph.sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    updatedParagraph.sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    
    
    
    const handleGenerateMatchingParagraphInfoQuestion = (sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');
        
        axios.post(`${config.API_BASE_URL}api/generateReadingMatchingParagraphInfo`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
    
            // Iterate over the keys in the response data (e.g., "1", "2", etc.)
            Object.keys(data).forEach((key, qIndex) => {
                if (key !== "options") { // Skip the "options" key
                    const questionData = data[key];
    
                    // Update the corresponding question in the state
                    const newQuestion: Question = {
                        question: questionData.question,
                        answer: questionData.answer,
                        explanation: questionData.explanation,
                        options: ''  // This field might not be needed if options are handled differently
                    };
    
                    // Update the section with the new question
                    updatedParagraph.sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    updatedParagraph.sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    
    
    const handleGenerateMatchingFeaturesQuestion = (sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');
        
    
        axios.post(`${config.API_BASE_URL}api/generateReadingMatchingFeatures`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
    
            // Iterate over the keys in the response data (e.g., "1", "2", etc.)
            Object.keys(data).forEach((key, qIndex) => {
                if (key !== "options") { // Skip the "options" key
                    const questionData = data[key];
    
                    // Update the corresponding question in the state
                    const newQuestion: Question = {
                        question: questionData.question,
                        answer: questionData.answer,
                        explanation: questionData.explanation,
                        options: ''  // This field might not be needed if options are handled differently
                    };
    
                    // Update the section with the new question
                    updatedParagraph.sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    updatedParagraph.sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    

    const handleGenerateMatchingSentenceEndingQuestion = (sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');

        
    
        axios.post(`${config.API_BASE_URL}api/generateReadingMatchingSentenceEnding`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const updatedParagraph = paragraph;
    
            // Iterate over the keys in the response data (e.g., "1", "2", etc.)
            Object.keys(data).forEach((key, qIndex) => {
                if (key !== "options") { // Skip the "options" key
                    const questionData = data[key];
    
                    // Update the corresponding question in the state
                    const newQuestion: Question = {
                        question: questionData.question,
                        answer: questionData.answer,
                        explanation: questionData.explanation,
                        options: ''  // This field might not be needed if options are handled differently
                    };
    
                    // Update the section with the new question
                    updatedParagraph.sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    updatedParagraph.sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    

    const handleGenerateMultipleChoiceOneAnswerQuestion = (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');

        
    
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingMCQOA`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
    
            const updatedParagraph = paragraph;
    
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                // Ensure there is a question entry for this index
                if (!updatedParagraph.sections[sIndex].questions[qIndex]) {
                    updatedParagraph.sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                updatedParagraph.sections[sIndex].questions[qIndex].question = questionData.question.trim();
                updatedParagraph.sections[sIndex].questions[qIndex].answer = questionData.answer.trim();
                updatedParagraph.sections[sIndex].questions[qIndex].explanation = questionData.explanation.trim();
                updatedParagraph.sections[sIndex].questions[qIndex].options = questionData.options
                .map((option: string) => option.trim())
                .join(', ')
                .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the state with the new questions
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };
    

    const handleGenerateMultipleChoiceMultipleAnswerQuestion = (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');

        
    
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingMCQMA`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
    
            const updatedParagraph = paragraph;
            console.log("HEY");
            Object.keys(data).forEach((key, qIndex) => {
                console.log("HI");
                const questionData = data[key];
                console.log(questionData);
                console.log(key);
                // Ensure there is a question entry for this index
                if (!updatedParagraph.sections[sIndex].questions[qIndex]) {
                    updatedParagraph.sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                updatedParagraph.sections[sIndex].questions[qIndex].question = questionData.question.trim();
                updatedParagraph.sections[sIndex].questions[qIndex].answer = questionData.answer.trim()                       // Removes space from the beginning and end of the string
                .replace(/,\s+/g, ',');
                updatedParagraph.sections[sIndex].questions[qIndex].explanation = questionData.explanation.trim();
                updatedParagraph.sections[sIndex].questions[qIndex].options = questionData.options
                .map((option: string) => option.trim())
                .join(', ')
                .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the state with the new questions
            setParagraph(updatedParagraph);
        })
        .catch(error => alert(error.response.data.error))
        
    };

    const handleGenerateQuestion = async(sIndex: number, selectedSectionType: string) => {
        if (!paragraph.title || !paragraph.content){
            alert("Paragraph is empty");
            return;
        }
        const selectedParagraph = paragraph;
        const title = selectedParagraph.title;
        const content = selectedParagraph.content;
        switch (selectedSectionType) {
            case 'Yes/No/Not Given':
                handleGenerateYNNQuestion(sIndex, title, content);
                break;
            case 'True/False/Not Given':
                handleGenerateTFNQuestion(sIndex, title, content);
                break;
            case 'Fill in the blank with one word only':
                handleGenerateFillOneWordQuestion(sIndex, title, content);
                break;
            case 'Fill in the blank with no more than two words':
                handleGenerateFillTwoWordQuestion(sIndex, title, content);
                break;
            case 'Matching Heading':
                handleGenerateMatchingHeadingQuestion(sIndex, title, content);
                break;
            case 'Matching Paragraph Information':
                handleGenerateMatchingParagraphInfoQuestion(sIndex, title, content);
                break;
            case 'Matching Features':
                handleGenerateMatchingFeaturesQuestion(sIndex, title, content);
                break;
            case 'Matching Sentence Endings':
                handleGenerateMatchingSentenceEndingQuestion(sIndex, title, content);
                break;
            case 'Multiple Choice One Answer':
                handleGenerateMultipleChoiceOneAnswerQuestion(sIndex, title, content);
                break;
            case 'Multiple Choice Multiple Answer':
                handleGenerateMultipleChoiceMultipleAnswerQuestion(sIndex, title, content);
                break;
            default:
                console.error('Unknown question type:', selectedSectionType);
        }
        
    };

    function getRandomQuestionTypes() {
        const shuffled = questionTypes.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    const handleCreateProblem = (statement: string) => {
        // Step 1: Generate the paragraph based on the statement
        handleGenerateParagraph(statement)
            .then(() => {
                // Step 2: Get the random question types after the paragraph is generated
                return getRandomQuestionTypes();
            })
            .then((typeArray) => {
                // Step 3: Generate questions for each type sequentially
                return typeArray.reduce((promise, type, index) => {
                    // Chain each question generation to ensure sequential processing
                    return promise.then(() => handleGenerateQuestion(index, type));
                }, Promise.resolve());
            })
            .catch((error) => {
                console.error("Error in handleCreateProblem:", error);
            });
    };
    
    

    const uploadOneProblemReading = async(topic: string) => {
        const token = localStorage.getItem('token');
        await axios.post(
            `${config.API_BASE_URL}api/upload_file_reading_statements`,
            { topic, paragraph },  // Upload each statement individually
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        setParagraph(emptyParagraph)
    }
    const uploadingProblemsReading = async() => {
        await extractStatements();
        {topics.map((topicData, index) => (
            topicData.statements.map(async(statement, i) => (
                await handleCreateProblem(statement),
                await uploadOneProblemReading(topicData.topic)
            ))
        ))}
    }
    return (
        <div className="App">
            <label>
                Select Type: 
                <select value={selectedType} onChange={handleTypeChange}>
                    <option value="Reading">Reading</option>
                    <option value="Writing">Writing</option>
                </select>
            </label>
            {selectedType === "Writing" && (
                <div>
                    <h1>Upload a Text File to Extract Topics and Statements</h1>

                    <input type="file" onChange={handleFileChange} />
                    <button onClick={uploadingProblemsWriting} disabled={!file || loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
            {selectedType === "Reading" && (
                <div>
                    <h1>Upload a Text File to Extract Topics and Statements</h1>

                    <input type="file" onChange={handleFileChange} />
                    <button onClick={uploadingProblemsReading} disabled={!file || loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default App;
