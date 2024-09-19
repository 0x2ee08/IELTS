const express = require('express');
const axios = require('axios');

const { authenticateToken } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY;
const router = express.Router();

router.post('/generate_listening_script', authenticateToken, async (req, res) => {
    const message = 'Generate a random script for the IELTS Listening Multiple Choice section without any bold text, special characters, questions or additional text. Provide the script only.';

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

        const evaluation = response.data.choices[0].message.content.trim();
        const lines = evaluation.split('\n').map(line => line.trim()).filter(line => line); // Remove empty lines and trim

        const title_ = lines[0] || '';
        const content_ = lines.slice(1).join('\n') || '';

        res.json({ title: title_, content: content_ });

    } catch (error) {
        console.error('Error generating listening script:', error);
        res.status(500).json({ message: 'Error generating listening script', error });
    }
});

router.post('/generate_listening_multiple_choice', authenticateToken, async (req, res) => {
    const { script } = req.body; // Destructure script from the request body
    const message = `Create 4 multiple choice questions for IELTS Listening based on the following script, without special characters or additional text. Provide questions with four options labeled A, B, C, and D:\n\n${script.content}`;

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

module.exports = router;
