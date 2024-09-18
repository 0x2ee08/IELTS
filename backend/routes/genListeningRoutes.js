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
    const message = `Generate a random topic script for the IELTS Listening Table Filling section without any bold text, special characters, or additional text. Provide only the script.`;

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

module.exports = router;