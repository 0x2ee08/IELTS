// ReadingRender.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
// import { TopologyDescription } from 'mongodb';

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
    const [paragraphs, setParagraphs] = useState<Paragraph[]>([
        { 
            title: '', 
            content: '', 
            sections: [{ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true }], 
            isOpen: true,
            vocabularyIsOpen: false
        }
    ]);;

    const [problemName, setProblemName] = useState('');
    const [accessUser, setAccessUser] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [newOption, setNewOption] = useState('');
    const [globalOptions, setGlobalOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [useVocab, setUseVocab] = useState(false);

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
        "Multiple Choice One Answer",
        "Multiple Choice Multiple Answer"
    ];

    const toggleParagraph = (index: number) => {
        setParagraphs(paragraphs.map((para, i) => i === index ? { ...para, isOpen: !para.isOpen } : para));
    };

    const toggleSection = (pIndex: number, sIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].sections[sIndex].isOpen = !newParagraphs[pIndex].sections[sIndex].isOpen;
        setParagraphs(newParagraphs);
    };

    const toggleVocabulary = (pIndex: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].vocabularyIsOpen = !newParagraphs[pIndex].vocabularyIsOpen;
        setParagraphs(newParagraphs);
    };
    
    const [vocabLevels, setVocabLevels] = useState<VocabularyLevels>({
        A1: [],
        A2: [],
        B1: [],
        B2: [],
        C1: [],
        C2: []
    });

    const preprocessWord = (word: string) => {
        return word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    };

    type VocabularyLevels = {
        A1: string[];
        A2: string[];
        B1: string[];
        B2: string[];
        C1: string[];
        C2: string[];
    };

    const determineWordLevel = (words: string) =>{
        return "A1";
    }
    
    
    const categorizeVocabulary = (content: string) => {
        const wordLevels: VocabularyLevels = {
            A1: [],
            A2: [],
            B1: [],
            B2: [],
            C1: [],
            C2: []
        };
    
        const words = content.split(/\s+/).map(preprocessWord);
    
        words.forEach(word => {
            const level = determineWordLevel(word); // This should return 'A1', 'A2', 'B1', etc.
            if (level && wordLevels[level as keyof VocabularyLevels]) {
                wordLevels[level as keyof VocabularyLevels].push(word);
            }
        });
    
        // Remove duplicates from each level
        for (const level in wordLevels) {
            if (wordLevels.hasOwnProperty(level)) {
                wordLevels[level as keyof VocabularyLevels] = Array.from(new Set(wordLevels[level as keyof VocabularyLevels]));
            }
        }
    
        return wordLevels;
    };
    

    const handleInputChange = (pIndex: number, field: 'title' | 'content', value: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex][field] = value;
        setVocabLevels(categorizeVocabulary(value));
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
        setParagraphs([...paragraphs, { title: '', content: '', sections: [{ type: '', options:[], questions: [{ question: '', answer: '', explanation: '', options: '' }], isOpen: true }], isOpen: true, vocabularyIsOpen: false }]);
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
        setIsLoading(true);
        // console.log(isLoading);

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
            setVocabLevels(categorizeVocabulary(response.data.content));
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });

    };

    const handleGenerateYNNQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
        setIsLoading(true);
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingYNN`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                // Ensure there is a question entry for this index
                if (!newParagraphs[pIndex].sections[sIndex].questions[qIndex]) {
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].question = questionData.question;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].answer = questionData.answer;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });

            // Update the state with the new questions
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };

    const handleGenerateTFNQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');
        setIsLoading(true);
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingTFNG`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                // Ensure there is a question entry for this index
                if (!newParagraphs[pIndex].sections[sIndex].questions[qIndex]) {
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].question = questionData.question;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].answer = questionData.answer;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });

            // Update the state with the new questions
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };

    const handleGenerateFillOneWordQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');

        setIsLoading(true);
    
        axios.post(`${config.API_BASE_URL}api/generateReadingFillOneWord`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                if (!newParagraphs[pIndex].sections[sIndex].questions[qIndex]) {
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].question = questionData.question;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].answer = questionData.answer;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });
    
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    

    const handleGenerateFillTwoWordQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');

        setIsLoading(true);
    
        axios.post(`${config.API_BASE_URL}api/generateReadingFillTwoWords`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                if (!newParagraphs[pIndex].sections[sIndex].questions[qIndex]) {
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].question = questionData.question;
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].answer = questionData.answer.trim()                       // Removes space from the beginning and end of the string
                .replace(/,\s+/g, ',');
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].explanation = questionData.explanation;
            });
    
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    

    const handleGenerateMatchingHeadingQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        axios.post(
            `${config.API_BASE_URL}api/generateReadingMatchingHeading`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
    
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
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    newParagraphs[pIndex].sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    
    
    
    const handleGenerateMatchingParagraphInfoQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        axios.post(`${config.API_BASE_URL}api/generateReadingMatchingParagraphInfo`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
    
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
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    newParagraphs[pIndex].sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    
    
    const handleGenerateMatchingFeaturesQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
    
        axios.post(`${config.API_BASE_URL}api/generateReadingMatchingFeatures`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
    
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
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    newParagraphs[pIndex].sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    

    const handleGenerateMatchingSentenceEndingQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        const token = localStorage.getItem('token');

        setIsLoading(true);
    
        axios.post(`${config.API_BASE_URL}api/generateReadingMatchingSentenceEnding`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            const newParagraphs = [...paragraphs];
    
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
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = newQuestion;
                } else {
                    // Update the options in the section
                    newParagraphs[pIndex].sections[sIndex].options = data[key];
                }
            });
    
            // Update the state with the new paragraphs
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    

    const handleGenerateMultipleChoiceOneAnswerQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');

        setIsLoading(true);
    
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingMCQOA`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
    
            const newParagraphs = [...paragraphs];
    
            Object.keys(data).forEach((key, qIndex) => {
                const questionData = data[key];
                // Ensure there is a question entry for this index
                if (!newParagraphs[pIndex].sections[sIndex].questions[qIndex]) {
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].question = questionData.question.trim();
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].answer = questionData.answer.trim();
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].explanation = questionData.explanation.trim();
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].options = questionData.options
                .map((option: string) => option.trim())
                .join(', ')
                .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the state with the new questions
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };
    

    const handleGenerateMultipleChoiceMultipleAnswerQuestion = (pIndex: number, sIndex: number, title: string, content: string) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');

        setIsLoading(true);
    
        // Make an API request with the title and content
        axios.post(`${config.API_BASE_URL}api/generateReadingMCQMA`, 
            { title, content },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
    
            const newParagraphs = [...paragraphs];
            console.log("HEY");
            Object.keys(data).forEach((key, qIndex) => {
                console.log("HI");
                const questionData = data[key];
                console.log(questionData);
                console.log(key);
                // Ensure there is a question entry for this index
                if (!newParagraphs[pIndex].sections[sIndex].questions[qIndex]) {
                    newParagraphs[pIndex].sections[sIndex].questions[qIndex] = { question: '', answer: '', explanation: '', options: '' };
                }
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].question = questionData.question.trim();
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].answer = questionData.answer.trim()                       // Removes space from the beginning and end of the string
                .replace(/,\s+/g, ',');
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].explanation = questionData.explanation.trim();
                newParagraphs[pIndex].sections[sIndex].questions[qIndex].options = questionData.options
                .map((option: string) => option.trim())
                .join(', ')
                .replace(/\s*,\s*/g, ','); // Remove spaces after commas
            });
    
            // Update the state with the new questions
            setParagraphs(newParagraphs);
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };

    const handleGenerateQuestion = (pIndex: number, sIndex: number) => {
        if (!paragraphs[pIndex].title || !paragraphs[pIndex].content){
            alert("Paragraph is empty");
            return;
        }
        const selectedParagraph = paragraphs[pIndex];
        const selectedSection = selectedParagraph.sections[sIndex];
        const title = selectedParagraph.title;
        const content = selectedParagraph.content;
        // console.log(selectedSection.type);
        switch (selectedSection.type) {
            case 'Yes/No/Not given':
                handleGenerateYNNQuestion(pIndex, sIndex, title, content);
                break;
            case 'True/False/Not Given':
                handleGenerateTFNQuestion(pIndex, sIndex, title, content);
                break;
            case 'Fill in the blank with one word only':
                handleGenerateFillOneWordQuestion(pIndex, sIndex, title, content);
                break;
            case 'Fill in the blank with no more than two words':
                handleGenerateFillTwoWordQuestion(pIndex, sIndex, title, content);
                break;
            case 'Matching Heading':
                handleGenerateMatchingHeadingQuestion(pIndex, sIndex, title, content);
                break;
            case 'Matching Paragraph Information':
                handleGenerateMatchingParagraphInfoQuestion(pIndex, sIndex, title, content);
                break;
            case 'Matching Features':
                handleGenerateMatchingFeaturesQuestion(pIndex, sIndex, title, content);
                break;
            case 'Matching Sentence Endings':
                handleGenerateMatchingSentenceEndingQuestion(pIndex, sIndex, title, content);
                break;
            case 'Multiple Choice One Answer':
                handleGenerateMultipleChoiceOneAnswerQuestion(pIndex, sIndex, title, content);
                break;
            case 'Multiple Choice Multiple Answer':
                handleGenerateMultipleChoiceMultipleAnswerQuestion(pIndex, sIndex, title, content);
                break;
            default:
                console.error('Unknown question type:', selectedSection.type);
        }
        
    };

    const createProblem = () => {
        // console.log(problemName);
        // console.log(paragraphs);

        //add contest id
        setIsLoading(true);

        const token = localStorage.getItem('token');

        axios.post(`${config.API_BASE_URL}api/createContestReading`, {
            paragraphs,
            problemName,
            accessUser,
            startTime,
            endTime,
            useVocab,
            "type" : "Reading"
        }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            const data = response.data;
            alert(data['status']);
            console.log(data);
            window.location.reload();
        })
        .catch(error => alert(error.response.data.error))
        .finally(() => {
            // console.log('Setting isLoading to false');
            setIsLoading(false);
        });
    };

    const removeDuplicates = (value: string) => {
        // Split the string by comma and trim any extra spaces
        const usersArray = value.split(',').map(user => user.trim());
      
        // Create a Set to remove duplicates
        const uniqueUsers = [...new Set(usersArray)];
      
        // Join the unique values back into a string
        return uniqueUsers.join(', ');
    };

    const addStudent =() =>{
        let value = accessUser;
        if(value !== '') value = value + ',' + studentClass;
        else value = studentClass;
        // console.log(value);
        value = value.replace(/,\s*/g, ', ');
        value = removeDuplicates(value);
        setAccessUser(value);
    };

    const [schoollist, setSchoollist] = useState<any[]>([]);
    const [classlist, setClasslist] = useState<any[]>([]);
    const [school, setSchool] = useState('');
    const [class_, setClass_] = useState('');
    const [studentClass, setStudentClass] = useState('');

    const getSchoolList = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_school_list`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSchoollist(response.data.result);
        } catch (error) {
            console.error('Error fetching school list:', error);
        }
    };

    const getClassList = async (selectedSchool: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_class_list`, { school: selectedSchool }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setClasslist(response.data.classlist || []);
        } catch (error) {
            console.error('Error fetching class list:', error);
        }
    };

    const getStudentList = async (selectedSchool: string, selectedClass: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/getAllStudent`, { school: selectedSchool, _class: selectedClass }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setStudentClass(response.data.students);
        } catch (error) {
            console.error('Error fetching class list:', error);
        }
    };

    const handleSchoolChange = (newschool: string) => {
        setSchool(newschool);
        setClass_(''); // Reset class selection when school changes
        setStudentClass('');
        getClassList(newschool); // Fetch classes for the selected school
    };

    const handleClassChange = (selectSchool: string, newclass: string) => {
        setClass_(newclass); // Reset class selection when school changes
        setStudentClass('');
        getStudentList(selectSchool, newclass);
    };

    useEffect(() => {
        getSchoolList();
    }, []);


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
            <div  className="border border-gray-300 rounded-md p-4 mb-4">
                Access user
                <input 
                    type="text" 
                    placeholder='Access User (comma separated, blank for public access)' 
                    className="border border-gray-300 px-4 py-2 rounded-md w-full my-2" 
                    value={accessUser}
                    onChange={handleAccessUserChange}
                />

                Or choose classes:

                <div className='flex space-x-4'>
                    <select
                        value={school}
                        onChange={(e) => handleSchoolChange(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    >
                        <option value="">Select a school</option>
                        {schoollist.map((schoolOption) => (
                            <option key={schoolOption.id} value={schoolOption.id}>
                                {schoolOption.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={class_}
                        onChange={(e) => handleClassChange(school, e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-md w-full"
                    >
                        <option value="">Select a class</option>
                        {classlist.map((schoolOption) => (
                            <option key={schoolOption} value={schoolOption.id}>
                                {schoolOption}
                            </option>
                        ))}
                    </select>
                </div>
                <br />
                <textarea
                    value={studentClass}
                    className="border border-gray-300 px-3 py-2 rounded-md w-full h-32"
                    disabled={true}
                />

                <button 
                    onClick={addStudent} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                    disabled={isLoading}
                >
                    Add Student
                </button>
            </div>
            
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
            <div className="my-4 space-x-4">
                <div className="my-4 flex  space-x-4">
                    <p className="font-semibold mb-0">Use Vocabulary (For students to learn through flashcards):</p>
                    <div className="flex items-center space-x-4 ml-4">
                        <label className="flex items-center space-x-2">
                            <input 
                                type="radio" 
                                name="useVocab" 
                                value="yes" 
                                checked={useVocab} 
                                onChange={() => setUseVocab(true)}
                            />
                            <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input 
                                type="radio" 
                                name="useVocab" 
                                value="no" 
                                checked={!useVocab} 
                                onChange={() => setUseVocab(false)}
                            />
                            <span>No</span>
                        </label>
                    </div>
                </div>
                {useVocab && (
                    <p className="text-red-600 ">Warning: Creating the contest may take an insanely long time (5 to 15 minutes) and consume alot of money (token) due to vocabulary processing.</p>
                )}
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
                                    disabled = {isLoading}
                                />
                                <button 
                                    onClick={() => handleGeneratePara(pIndex, paragraph.title, paragraph.content)}
                                    // onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                    className="px-2 rounded-md ml-2"
                                    disabled={isLoading}
                                >
                                    Generate
                                </button>
                            </div>
        
                            <textarea 
                                placeholder='Content' 
                                className="border border-gray-300 px-4 py-2 rounded-md w-full h-64 my-2" 
                                value={paragraph.content} 
                                onChange={(e) => handleInputChange(pIndex, 'content', e.target.value)}
                                disabled = {isLoading}
                            ></textarea>

                            {/* <div className="border border-gray-300 rounded-md p-4 mb-4">
                                <div 
                                    onClick={() => toggleVocabulary(pIndex)} 
                                    className="cursor-pointer flex justify-between items-center"
                                >
                                    <h4>Vocabulary</h4>
                                    <span>{paragraph.vocabularyIsOpen ? '-' : '+'}</span>
                                </div>
                                {paragraph.vocabularyIsOpen && (
                                    <table className="w-full mt-2">
                                        <thead>
                                            <tr>
                                                <th className="text-left">Level</th>
                                                <th className="text-left">Words</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(vocabLevels).map(level => (
                                                <tr key={level}>
                                                    <td className="font-bold">{level}</td>
                                                    <td>{vocabLevels[level as keyof VocabularyLevels].join(', ')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div> */}

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
                                                    onClick={() => handleGenerateQuestion(pIndex, sIndex)}
                                                    className="px-2 rounded-md ml-2"
                                                    disabled={!paragraph.title || !paragraph.content || isLoading}
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
                                                    ) : section.type === 'Multiple Choice One Answer' || section.type === 'Multiple Choice Multiple Answer' ? (
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
                                                                {q.options.split(',').map((option, optIndex) => {
                                                                    const selectedOptions = q.answer ? q.answer.split(',') : [];
                                                                    return (
                                                                        <div key={optIndex} className="flex items-center mb-2">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name={`options-${pIndex}-${sIndex}-${qIndex}`} 
                                                                                value={option}
                                                                                checked={selectedOptions.includes(option)}
                                                                                onChange={(e) => {
                                                                                    let updatedAnswer = [...selectedOptions];
                                                                                    if (e.target.checked) {
                                                                                        updatedAnswer.push(option);
                                                                                    } else {
                                                                                        updatedAnswer = updatedAnswer.filter(ans => ans !== option);
                                                                                    }
                                                                                    handleQuestionChange(pIndex, sIndex, qIndex, updatedAnswer.join(','), 'answer');
                                                                                }}
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
                                                                    );
                                                                })}
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
                                                            
                                                            <button 
                                                                onClick={() => deleteQuestion(pIndex, sIndex, qIndex)} 
                                                                className="px-2 rounded-md ml-2"
                                                            >
                                                                x
                                                            </button>

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
                disabled={isLoading}
            >
                Create Problem
            </button>
        </div>
    );

    return renderParagraphs();
};

export default ReadingRender;
