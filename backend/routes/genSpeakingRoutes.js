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

router.post('/generateSpeakingTask1', authenticateToken, async (req, res) => {
    const { number_of_task } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`problemset`);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me ${number_of_task} speaking task 1 questions that the following conditions hold:\n
            - The topic is similar to contestant's personal interest, family, home, life, friend and so on\n
            - The question is much simple as possible\n
            - Only give me the question, no title, opening, or anything else\n
            For example:
            [QUESTION 1]: What is ...\n
            [QUESTION 2]: How ...\n
            ...\n
            [QUESTION ${number_of_task}] Why ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

module.exports = router;