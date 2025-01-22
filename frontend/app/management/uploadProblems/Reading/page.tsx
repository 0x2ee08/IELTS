'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';
import { AxiosError } from 'axios';
// import { TopologyDescription } from 'mongodb';
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


const ReadingRender: React.FC = () => {

    const [file, setFile] = useState<File | null>(null);
    const [topics, setTopics] = useState<TopicData[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };
    
    const extractStatements = async () => {
        const token = localStorage.getItem('token');
    
        if (!file) return [];
    
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
    
            const result = response.data.topics; // Assuming topics is an array
            setTopics(result); // Update state
            return result; // Return extracted topics
        } catch (err) {
            console.error('Error extracting topics and statements:', err);
            setError('An error occurred while extracting the topics and statements.');
            setTopics([]);
            return []; // Return an empty array on error
        } finally {
            setLoading(false);
        }
    };

    const [paragraph, setParagraph] = useState<Paragraph>(
        { 
            title: '', 
            content: '', 
            sections: [{ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true },
                    { type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true }], 
            isOpen: true,
            vocabularyIsOpen: false
        }
    );;

    const [isLoading, setIsLoading] = useState(false);

    const questionTypes = [
        "Yes/No/Not Given",
        "True/False/Not Given",
        "Fill in the blank with one word only",
        "Fill in the blank with no more than two words",
        // "Matching Heading",
        // "Matching Paragraph Information",
        // "Matching Features",
        // "Matching Sentence Endings",
        "Multiple Choice One Answer",
        "Multiple Choice Multiple Answer"
    ];

    const handleGenerateParagraph = (statement: string): Promise<Paragraph> => {
        return new Promise((resolve, reject) => {
            setIsLoading(true);
    
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication token is missing. Please log in again.");
                reject("Missing authentication token");
                return;
            }
    
            axios
                .post(
                    `${config.API_BASE_URL}api/generateReadingParagraphForStatement`,
                    { statement },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then(response => {
                    const { title, content } = response.data;    
                    if (!title || !content) {
                        alert("Failed to generate paragraph. Incomplete response.");
                        console.error("Incomplete response:", response.data);
                        reject("Incomplete paragraph data");
                        return;
                    }
    
                    const updatedParagraph = {
                        ...paragraph,
                        title,
                        content,
                    };
    
                    setParagraph(updatedParagraph); // Update the state
                    resolve(updatedParagraph); // Resolve with the updated paragraph
                })
                .catch(error => {
                    console.error("Error generating paragraph:", error);
                    alert(
                        error.response?.data?.error ||
                        "An error occurred while generating the paragraph."
                    );
                    reject(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        });
    };

    const handleGenerateYNNQuestion = async (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingYNN`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateTFNQuestion = async (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingTFNG`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateFillOneWordQuestion = async (sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingFillOneWord`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateFillTwoWordQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingFillTwoWords`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer.trim();
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateMatchingHeadingQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingMatchingHeading`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    
    
    const handleGenerateMatchingParagraphInfoQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingMatchingParagraphInfo`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    
    
    const handleGenerateMatchingFeaturesQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingMatchingFeatures`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateMatchingSentenceEndingQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingMatchingSentenceEnding`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question;
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer;
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateMultipleChoiceOneAnswerQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingMCQOA`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question.trim();
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer.trim();
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation.trim();
                updatedSections[sIndex].questions[qIndex].options = questionData.options;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };
    

    const handleGenerateMultipleChoiceMultipleAnswerQuestion = async(sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
    
        setIsLoading(true);
    
        try {
            // Make an API request with the title and content
            const response = await axios.post(
                `${config.API_BASE_URL}api/generateReadingMCQMA`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
    
            // Check if the response contains the expected data
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid API response structure.");
            }
    
            // Update the specific section's questions in the paragraph
            const updatedSections = [...paragraph.sections];
    
            // Iterate over the response data
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
    
                // Ensure there is a question entry for this index
                if (!updatedSections[sIndex].questions[qIndex]) {
                    updatedSections[sIndex].questions[qIndex] = {
                        question: '',
                        answer: '',
                        explanation: '',
                        options: '',
                    };
                }
    
                // Update the question details
                updatedSections[sIndex].questions[qIndex].question = questionData.question.trim();
                updatedSections[sIndex].questions[qIndex].answer = questionData.answer.trim();
                updatedSections[sIndex].questions[qIndex].explanation = questionData.explanation.trim();
                updatedSections[sIndex].questions[qIndex].options = questionData.options;
    
                // Ensure options are safely handled
                const options = Array.isArray(questionData.options)
                    ? questionData.options
                    : []; // Fallback to empty array if options is not an array
    
                updatedSections[sIndex].questions[qIndex].options = options
                    .map((option: string) => option) // Trim each option
                    .join(', ')
                    .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the paragraph state with the modified section
            setParagraph((prevParagraph) => ({
                ...prevParagraph,
                sections: updatedSections,
            }));
    
        } catch (error: unknown) {
            
    
            if (error instanceof AxiosError) {
                // Handle AxiosError specifically
                alert(`API Error: ${error.response?.data?.error || error.message}`);
            } else if (error instanceof Error) {
                // Handle general errors (e.g., throw new Error inside try block)
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                // Fallback for unknown error types
                alert("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false); // Set loading state back to false
        }
    };

    const handleGenerateQuestion = async (paragraph: Paragraph, sIndex: number): Promise<boolean> => {
        if (!paragraph.title || !paragraph.content) {
            alert("Paragraph is empty");
            return false;
        }
    
        const selectedParagraph = paragraph;
        const selectedSection = selectedParagraph.sections[sIndex];
        const title = selectedParagraph.title;
        const content = selectedParagraph.content;
    
        try {
            switch (selectedSection.type) {
                case 'Yes/No/Not Given':
                    await handleGenerateYNNQuestion(sIndex, title, content);
                    break;
                case 'True/False/Not Given':
                    await handleGenerateTFNQuestion(sIndex, title, content);
                    break;
                case 'Fill in the blank with one word only':
                    await handleGenerateFillOneWordQuestion(sIndex, title, content);
                    break;
                case 'Fill in the blank with no more than two words':
                    await handleGenerateFillTwoWordQuestion(sIndex, title, content);
                    break;
                case 'Matching Heading':
                    await handleGenerateMatchingHeadingQuestion(sIndex, title, content);
                    break;
                case 'Matching Paragraph Information':
                    await handleGenerateMatchingParagraphInfoQuestion(sIndex, title, content);
                    break;
                case 'Matching Features':
                    await handleGenerateMatchingFeaturesQuestion(sIndex, title, content);
                    break;
                case 'Matching Sentence Endings':
                    await handleGenerateMatchingSentenceEndingQuestion(sIndex, title, content);
                    break;
                case 'Multiple Choice One Answer':
                    await handleGenerateMultipleChoiceOneAnswerQuestion(sIndex, title, content);
                    break;
                case 'Multiple Choice Multiple Answer':
                    await handleGenerateMultipleChoiceMultipleAnswerQuestion(sIndex, title, content);
                    break;
                default:
                    console.error('Unknown question type:', selectedSection.type);
                    return false;
            }
            return true; // Successfully generated question
        } catch (error) {
            console.error(`Error generating question for section ${sIndex}:`, error);
            return false; // Failed to generate question
        }
    };
    

    const getRandomQuestionTypes = (): string[] => {
        // Exclude the first option ("Choose a question type")
        const validQuestionTypes = questionTypes.slice(1);
    
        // Shuffle array securely
        const shuffledTypes = validQuestionTypes.sort(() => Math.random() - 0.5);
    
        // Return the first two types
        return shuffledTypes.slice(0, 2);
    };
    
    
    const uploadProblemReading = async (topic: string, paragraph: Paragraph): Promise<void> => {
        if (!paragraph) {
            alert("Paragraph is missing.");
            return;
        }
    
        if (!paragraph.title) {
            alert("Paragraph title is missing.");
            return;
        }
    
        if (!paragraph.content) {
            alert("Paragraph content is missing.");
            return;
        }
    
        try {
            setIsLoading(true); // Show loading indicator
    
            const token = localStorage.getItem('token'); // Token for authorization (if needed)
    
            // Send the paragraph data to the backend
            const response = await axios.post(
                `${config.API_BASE_URL}api/upload_reading_problem`,
                { topic, paragraph },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        } catch (error: any) {
            if (error.response) {
                console.error("Server Error:", error.response.data);
                alert(`Error uploading paragraph: ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
                console.error("Network Error:", error.request);
                alert("Network error: Unable to reach the server. Please check your connection.");
            } else {
                console.error("Unexpected Error:", error.message);
                alert(`Unexpected error: ${error.message}`);
            }
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };
    
    
    const createProblem = async (topics: TopicData[]): Promise<void> => {
        if (!topics || topics.length === 0) {
            alert("No topics available to generate questions.");
            return;
        }
    
        for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
            const topic = topics[topicIndex];
    
            if (!topic.statements || topic.statements.length === 0) {
                console.warn(`${topic.topic} has no statements.`);
                continue;
            }
    
            for (let statementIndex = 0; statementIndex < topic.statements.length; statementIndex++) {
                const statement = topic.statements[statementIndex];
    
                try {
                    // Step 1: Generate the paragraph
                    const generatedParagraph = await handleGenerateParagraph(statement);
                    setParagraph(generatedParagraph);
    
                    // Ensure the paragraph is valid
                    if (!generatedParagraph.title || !generatedParagraph.content) {
                        alert("Failed to generate a valid paragraph.");
                        continue;
                    }
    
                    const randomQuestionTypes = getRandomQuestionTypes();
    
                    // Step 2: Generate all questions for the paragraph
                    await Promise.all(
                        randomQuestionTypes.map(async (type, sIndex) => {
                            generatedParagraph.sections[sIndex].type = type;
                            await handleGenerateQuestion(generatedParagraph, sIndex);
                        })
                    );
    
                    // Step 3: Upload the paragraph after all questions are generated
                    await uploadProblemReading(topic.topic, generatedParagraph);
    
                    // Clear the paragraph state only after the upload is complete
                    setParagraph({
                        title: '',
                        content: '',
                        sections: [
                            {
                                type: '',
                                options: [],
                                questions: [{ question: '', answer: '', explanation: '', options: '' }],
                                isOpen: true,
                            },
                            {
                                type: '',
                                options: [],
                                questions: [{ question: '', answer: '', explanation: '', options: '' }],
                                isOpen: true,
                            },
                        ],
                        isOpen: true,
                        vocabularyIsOpen: false,
                    });
                } catch (error) {
                    console.error("Error in paragraph generation:", error);
                }
            }
        }
    };
    
    

    const uploadingProblemsReading = async () => {
        try {
            const extractedTopics = await extractStatements(); // Get topics directly
    
            if (!extractedTopics || extractedTopics.length === 0) {
                console.warn("No topics were extracted. Aborting.");
                return;
            }
    
            await createProblem(extractedTopics); // Pass topics
        } catch (error) {
            console.error("Error during uploadingProblemsReading:", error);
        }
    };
    
    
    return(
        <div>
            <div className="App">
                <div>
                    <h1>Upload a Text File to Extract Topics and Statements</h1>

                    <input type="file" onChange={handleFileChange} />
                    <button onClick={uploadingProblemsReading} disabled={!file || loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div>
                    {topics.length > 0 && (
                        <div>
                            <h2>Extracted Topics and Statements</h2>
                            {topics.map((topic, topicIndex) => (
                                <div key={topicIndex} style={{ marginBottom: '20px' }}>
                                    <h3>Topic {topicIndex + 1}: {topic.topic || 'Untitled'}</h3>
                                    {topic.statements?.length > 0 ? (
                                        <ul>
                                            {topic.statements.map((statement, statementIndex) => (
                                                <li key={statementIndex}>{statement}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No statements found for this topic.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                        {topics.length === 0 && !loading && !error && (
                            <p>No topics available. Please upload a file to extract topics and statements.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default ReadingRender;
