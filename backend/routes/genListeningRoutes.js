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

router.post('/generateReadingParagraph', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const db = await connectToDatabase();

    console.log(title, content);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me a paragraph of IELTS Reading around 800 words, 6 sections with this topic "${title}"(if empty then random) and some of first line content: "${content}"(if empty then random) [ONLY GIVE THE TITLE AND THE PARAGRAPH, DO NOT SAY ANYTHING ELSE, HAVE EXACTLY 6 SMALLER SECTION, 800 WORD MINIMUM, DO NOT HAVE TITLE FOR EACH SECTION]`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();

    var lines = evaluation.split('\n');

    var title_ = lines[0].trim();

    var content_ = lines.slice(1).join('\n').trim();

    res.json({title: title_, content: content_});
});

function parseEvaluationType1(evaluation) {
    const evaluationObject = {};
    const questionBlocks = evaluation.split('<END>').filter(block => block.trim() !== '');

    questionBlocks.forEach((block, index) => {
        const questionMatch = block.match(/\[QUESTION (\d+)\]\s*(.*)/);
        const answerMatch = block.match(/\[ANSWER (\d+)\]\s*(.*)/);
        const explanationMatch = block.match(/\[EXPLANATION (\d+)\]\s*(.*)/);

        if (questionMatch && answerMatch && explanationMatch) {
            const questionIndex = index + 1;
            evaluationObject[questionIndex] = {
                question: questionMatch[2].trim(),
                answer: answerMatch[2].trim(),
                explanation: explanationMatch[2].trim(),
            };
        }
    });

    return evaluationObject;
}

function parseEvaluationType3(evaluation) {
    const evaluationObject = {
        options: [],
    };
    
    // Extract options
    const optionMatches = [...evaluation.matchAll(/\[OPTION \d+\]\s*(.*)/g)];
    optionMatches.forEach(option => {
        evaluationObject.options.push(option[1].trim());
    });

    // Extract questions, answers, and explanations
    const questionBlocks = evaluation.split('<END>').filter(block => block.trim() !== '');
    questionBlocks.forEach((block, index) => {
        const questionMatch = block.match(/\[QUESTION (\d+)\]\s*(.*)/);
        const answerMatch = block.match(/\[ANSWER (\d+)\]\s*(.*)/);
        const explanationMatch = block.match(/\[EXPLANATION (\d+)\]\s*(.*)/);

        if (questionMatch && answerMatch && explanationMatch) {
            const questionIndex = index + 1;
            evaluationObject[questionIndex] = {
                question: questionMatch[2].trim(),
                answer: answerMatch[2].trim(),
                explanation: explanationMatch[2].trim(),
            };
        }
    });

    return evaluationObject;
}

function parseEvaluationType4(evaluation) {
    const evaluationObject = {
        options: [],
    };
    
    // Extract options
    const optionMatches = [...evaluation.matchAll(/\[OPTION \d+\]\s*(.*)/g)];
    optionMatches.forEach(option => {
        evaluationObject.options.push(option[1].trim());
    });

    // Extract questions, answers, and explanations
    const questionBlocks = evaluation.split('<END>').filter(block => block.trim() !== '');
    questionBlocks.forEach((block, index) => {
        const questionMatch = block.match(/\[FEATURE (\d+)\]\s*(.*)/);
        const answerMatch = block.match(/\[ANSWER (\d+)\]\s*(.*)/);
        const explanationMatch = block.match(/\[EXPLANATION (\d+)\]\s*(.*)/);

        if (questionMatch && answerMatch && explanationMatch) {
            const questionIndex = index + 1;
            evaluationObject[questionIndex] = {
                question: questionMatch[2].trim(),
                answer: answerMatch[2].trim(),
                explanation: explanationMatch[2].trim(),
            };
        }
    });

    return evaluationObject;
}

function parseEvaluationType5(evaluation) {
    const evaluationObject = {
        options: [],
    };
    
    // Extract options
    const optionMatches = [...evaluation.matchAll(/\[OPTION \d+\]\s*(.*)/g)];
    optionMatches.forEach(option => {
        evaluationObject.options.push(option[1].trim());
    });

    // Extract questions, answers, and explanations
    const questionBlocks = evaluation.split('<END>').filter(block => block.trim() !== '');
    questionBlocks.forEach((block, index) => {
        const questionMatch = block.match(/\[SENTENCE (\d+)\]\s*(.*)/);
        const answerMatch = block.match(/\[ANSWER (\d+)\]\s*(.*)/);
        const explanationMatch = block.match(/\[EXPLANATION (\d+)\]\s*(.*)/);

        if (questionMatch && answerMatch && explanationMatch) {
            const questionIndex = index + 1;
            evaluationObject[questionIndex] = {
                question: questionMatch[2].trim(),
                answer: answerMatch[2].trim(),
                explanation: explanationMatch[2].trim(),
            };
        }
    });

    return evaluationObject;
}

function parseEvaluationType2(evaluation) {
    const evaluationObject = {};
    const questionBlocks = evaluation.split('<END>').filter(block => block.trim() !== '');

    questionBlocks.forEach(block => {
        const questionMatch = block.match(/\[QUESTION (\d+)\]\s*(.*)/);
        const answerMatch = block.match(/\[ANSWER (\d+)\]\s*(.*)/);
        const explanationMatch = block.match(/\[EXPLAINATION (\d+)\]\s*(.*)/);

        if (questionMatch && answerMatch && explanationMatch) {
            const questionIndex = questionMatch[1].trim();
            const options = [];
            const optionMatches = [...block.matchAll(/\[OPTION \d+\]\s*(.*)/g)];

            optionMatches.forEach(option => {
                options.push(option[1].trim());
            });

            evaluationObject[questionIndex] = {
                question: questionMatch[2].trim(),  // Include the question text
                options: options,
                answer: answerMatch[2].trim(),
                explanation: explanationMatch[2].trim(),
            };
        }
    });

    return evaluationObject;
}

module.exports = router;