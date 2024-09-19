const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY
const router = express.Router();

router.post('/generate_listening_script', authenticateToken, async (req, res) => {
    const message = `Generate a random script for the IELTS Listening Multiple Choice section without any bold text, special characters, questions or additional text. Provide the script only.`;

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
        const lines = evaluation.split('\n');
        const title_ = lines[0].trim();
        const content_ = lines.slice(1).join('\n').trim();

        res.json({ title: title_, content: content_ });

    } catch (error) {
        console.error('Error generating listening script:', error);
        res.status(500).json({ message: 'Error generating listening script', error });
    }
});

router.post('/generate_listening_multiple_choice', authenticateToken, async (req, res) => {
    const { script } = req.body; // Destructure script from the request body
    const message = `Create 4 multiple choice questions for IELTS Listening based on the following script, with out special character or additional text. Provide questions with four options labeled A, B, C, and D:\n\n${script.content}`; // Pass only the content of the script

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
            const lines = mcq.split('\n');
            const question = lines[0]; // First line is the question
            const answers = lines.slice(1); // Rest are answer options
            return { question, answers };
        });

        res.json(mcqs); // Send back the formatted MCQs

    } catch (error) {
        console.error('Error generating listening questions:', error);
        res.status(500).json({ message: 'Error generating listening questions', error });
    }
});

module.exports = router;