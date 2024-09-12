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
            - The topic is similar to contestant's life\n
            - Only give me the question, no title, opening, or anything else\n
            - Question 1 is always something like 'can you introduct yourself' (with paraphrase)\n
            For example:\n
            [Q1]: What is ...\n
            [Q2]: How ...\n
            ...\n
            [Q${number_of_task}] Do you ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/generateSpeakingTask1_onlyOne', authenticateToken, async (req, res) => {

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me one speaking task 1 questions that the following conditions hold:\n
            - The topic is similar to contestant's personal life\n
            - Only give me the question, no title, opening, or anything else\n
            For example:\n
            What is ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/create_speaking_problem', authenticateToken, async (req, res) => {
    const { taskArray } = req.body;
    const time_created = new Date();

    const db = await connectToDatabase();
    const problemCollection = db.collection('problem');

    const count = await problemCollection.countDocuments();
    const nextProblemId = count + 1;

    const result = await problemCollection.insertOne({
        problem_id: String(nextProblemId),
        type: "Speaking",
        taskArray: taskArray || [],
    });

    res.json({ success: true, message: 'Problem created successfully' });
});

module.exports = router;