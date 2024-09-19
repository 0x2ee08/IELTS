const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { MODEL_NAME, SPEAKING_MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const generateModel = MODEL_NAME;
const model = SPEAKING_MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY
const router = express.Router();

router.post('/generateSpeakingTask1', authenticateToken, async (req, res) => {
    const { number_of_task } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`problemset`);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: generateModel,
        messages: [{ role: 'system', content: `Give me ${number_of_task} speaking task 1 questions that the following conditions hold:\n
            - The topic is around contestant's life and simple\n
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
        model: generateModel,
        messages: [{ role: 'system', content: `Give me one speaking task 1 questions that the following conditions hold:\n
            - The topic is around contestant's life and simple\n
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

router.post('/generateSpeakingTask2', authenticateToken, async (req, res) => {
    const { number_of_task } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`problemset`);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: generateModel,
        messages: [{ role: 'system', content: `Give me ${number_of_task} speaking task 1 questions that the following conditions hold:\n
            - The topic is one of this (describe an experience (movie, book, event, ...), describe a person, places, work and study, ...)\n
            - Only give me the question, no title, opening, or anything else\n
            - Question 1 is always something like 'can you introduct yourself' (with paraphrase)\n
            For example:\n
            [Q1]: Describe ...\n
            [Q2]: Introduce ...\n
            ...\n
            [Q${number_of_task}] What your ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/generateSpeakingTask2_onlyOne', authenticateToken, async (req, res) => {

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: generateModel,
        messages: [{ role: 'system', content: `Give me one speaking task 1 questions that the following conditions hold:\n
            - The topic is one of this (describe an experience (movie, book, event, ...), describe a person, places, work and study, ...)\n
            - Only give me the question, the suggestion, no title, opening, or anything else\n
            For example:\n
            Describe ... You should say:
            - Where ... When
            - Why ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/generateSpeakingTask3', authenticateToken, async (req, res) => {
    const { number_of_task } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`problemset`);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: generateModel,
        messages: [{ role: 'system', content: `Give me ${number_of_task} speaking task 1 questions that the following conditions hold:\n
            - The topic is about society problem, interest, trend, ...\n
            - Only give me the question, no title, opening, or anything else\n
            For example:\n
            [Q1]: Describe ...\n
            [Q2]: Introduce ...\n
            ...\n
            [Q${number_of_task}] What your ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/generateSpeakingTask3_onlyOne', authenticateToken, async (req, res) => {

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: generateModel,
        messages: [{ role: 'system', content: `Give me one speaking task 1 questions that the following conditions hold:\n
            - The topic is about society problem, interest, trend, ...\n
            - Only give me the question, no title, opening, or anything else\n
            For example:\n
            Describe ...`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/create_speaking_problem', authenticateToken, async (req, res) => {
    const { problemName, accessUser, startTime, endTime, taskArray } = req.body;
    const username = req.user;
    const time_created = new Date();

    const db = await connectToDatabase();
    const problemCollection = db.collection('contest');

    const count = await problemCollection.countDocuments();
    const nextProblemId = count + 1;

    const result = await problemCollection.insertOne({
        id: String(nextProblemId),
        type: "Speaking",
        taskArray: taskArray || [],
        accessUser: accessUser,
        startTime: startTime,
        endTime: endTime,
        problemName: problemName,
        created_by: username.username,
        userAnswer: [],
    });

    res.json({ success: true, message: 'Problem created successfully' });
});

router.post('/getSpeakingLexicalResource', authenticateToken, async (req, res) => {
    const { question, answer } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `For this question: ${question}. Give me ielts band and improvement about vocabulary of this answer: ${answer}
            Only give me the result, no title, opening, or anything else\n
            Give me the ielts band of original answer first\n
            Then, check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
            For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
            [BAND]: {number} [E]: word1 [word2](correct_word2 - error_word2) word3...\n
            -Because word1 and word3 are correct while word2 is not correct`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/getSpeakingGrammar', authenticateToken, async (req, res) => {
    const { question, answer } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `For this question: ${question}. Give me ielts band and improvement about grammar of this answer: ${answer}
            Only give me the result, no title, opening, or anything else\n
            Give me the ielts band of original answer first\n
            Check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
            For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
            [BAND]: {number} [E]: word1 [word2](correct_word2 - error_word2) word3... \n
            -Because word1 and word3 are correct while word2 is not correct`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

module.exports = router;