const express = require('express');
const axios = require('axios');

const { authenticateToken } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY, LISTENING_GENERATE_MODEL_NAME } = require('../config/config');

const { conversation, mcq, saq } = require('./listening/message.js');

const model = MODEL_NAME;
const generateModel = LISTENING_GENERATE_MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY;
const router = express.Router();

router.post('/generateListeningTask1', authenticateToken, async (req, res) => {
    const {task} = req.body;

    let message = ``;
    if(task.topic !== "") {
        message = message + `Given the following topic: ${task.topic}\n`;
    }
    else {
        message = message + `Given the following topic: typical social topics\n`;
    }

    message = message + `Use the language tone: ${task.languageTone}\n`;
    message = message + `Set the difficulty is ${task.difficulty}\n`;

    if(task.typeOfAudio === "conversation") message = message + `${conversation}`;

    console.log(message);

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{
                role: 'system',
                content: message,
            }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content.trim();

        res.json({ content: content });

    } catch (error) {
        console.error('Error generating listening script:', error);
        res.status(500).json({ message: 'Error generating listening script', error });
    }
});

router.post('/generateExercise', authenticateToken, async (req, res) => {
    const {task, idx, script} = req.body;

    let message = `Here is the script of the audio: ${script}\n`;
    if(task.exercise[idx].typeOfQuestion === "Multiple choice") {
        message = message + "Generate " + `${task.exercise[idx].numbefOfQuestion}` + `${mcq}`
    }

    console.log(message);

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{
                role: 'system',
                content: message,
            }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content.trim();

        res.json({ content: content });

    } catch (error) {
        console.error('Error generating listening script:', error);
        res.status(500).json({ message: 'Error generating listening script', error });
    }
});

router.post('/generate_listening_table_filling', authenticateToken, async (req, res) => {
    const { script } = req.body; // Get the script from the request body
    const message = `Based on the following script, create a table-filling summary in the format of an array of "category: information", choose random at most 7 categories, where each category summarizes key features of the script for IELTS Table Filling, no additional text, special characters, just provide the array only and without speakers category:\n\n${script.content}`;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{
                role: 'system',
                content: message,
            }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const tableFilling = response.data.choices[0].message.content.trim();

        // Split the response into an array of categories and information
        const formattedTableFilling = tableFilling.split('\n').map(row => {
            const [category, information] = row.split(':').map(part => part.trim());
            return category && information ? { category, information } : null;
        }).filter(row => row); // Remove any null or undefined entries

        res.json({ tableFilling: formattedTableFilling });

    } catch (error) {
        console.error('Error generating table filling:', error);
        res.status(500).json({ message: 'Error generating table filling', error });
    }
});

router.post('/generate_listening_short_answer_question', authenticateToken, async (req, res) => {
    const { script } = req.body; // Destructure script from the request body
    const message = `Create 4 short answer questions for IELTS Listening based on the following script, with the answer for each question is NO MORE THAN 2 WORDS, without special characters or additional text. Provide questions with four options labeled A, B, C, and D:\n\n${script.content}`;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{
                role: 'system',
                content: message,
            }], 
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const evaluation = response.data.choices[0].message.content.trim();

        // Format the response into MCQs
        const mcqs = evaluation.split('\n\n').map(mcq => {
            const lines = mcq.split('\n').map(line => line.trim()).filter(line => line);
            const question = lines[0] || ''; // First line is the question
            const answers = lines.slice(1); // Rest are answer options
            return { question, answers };
        }).filter(mcq => mcq.question); // Remove MCQs with no question

        res.json(mcqs); // Send back the formatted MCQs

    } catch (error) {
        console.error('Error generating listening questions:', error);
        res.status(500).json({ message: 'Error generating listening questions', error });
    }
});

router.post('/generate_listening_matchings', authenticateToken, async (req, res) => {
    const { script } = req.body;

    if (!script || !script.content) {
        return res.status(400).json({ message: 'Invalid script data' });
    }

    const message = `Generate a matching exercise based on the following script. Provide exactly 5 features and 5 questions. Each question should match with one of the features. Format the response without bold, additional words, or special characters. Provide features and questions in a clear list format, with features and questions separated by headings:\n\nFeatures:\n1. Feature 1\n2. Feature 2\n3. Feature 3\n4. Feature 4\n5. Feature 5\n\nQuestions:\n1. Question 1\n2. Question 2\n3. Question 3\n4. Question 4\n5. Question 5\n\n${script.content}`;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'system', content: message }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const matchings = response.data.choices[0].message.content.trim();

        // Ensure `matchings` is properly formatted
        if (!matchings) {
            throw new Error('No matchings data received');
        }

        // Split the response into features and questions based on the headings
        const [featuresPart, questionsPart] = matchings.split('\n\n').map(part => part.trim());

        // Ensure we have exactly 2 parts
        if (!featuresPart || !questionsPart) {
            throw new Error('Invalid format received');
        }

        // Extract features and questions
        const featuresLines = featuresPart.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('Features:'));
        const questionsLines = questionsPart.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('Questions:'));

        // Ensure we have exactly 5 features and 5 questions
        if (featuresLines.length !== 5 || questionsLines.length !== 5) {
            throw new Error('Incorrect number of features or questions received');
        }

        // Format the response
        const formattedMatchings = questionsLines.map((question, index) => ({
            question: question,
            feature: featuresLines[index] || '', // Map questions to features
        }));

        res.json({ matchings: formattedMatchings });

    } catch (error) {
        console.error('Error generating listening matchings:', error);
        res.status(500).json({ message: 'Error generating listening matchings', error });
    }
});


module.exports = router;
