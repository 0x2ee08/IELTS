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
    const blogsCollection = db.collection(`problemset`);

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

router.post('/generateReadingYNN', authenticateToken, async(req, res) => {
    const {title, content} = req.body;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me 6 questions (Yes/No/Not Given [Each type should appear on at least 1 questions]) [Answer should be "Yes", "No" or "Not Given". Write it in correct format ] IELTS Reading task (THE QUESTION SHOULD BE PARAPHASED) base on this paragraph : "${content}" with the title "${title}".
OUTPUT FORMAT:
[QUESTION 1]
[ANSWER 1]
[EXPLAINATION 1]
<END>
[QUESTION 2]
[ANSWER 2]
[EXPLAINATION 2]
<END>
....
[QUESTION 6]
[ANSWER 6]
[EXPALINATION 6]
<END>`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();

    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
});

router.post('/generateReadingTFNG', authenticateToken, async(req, res) => {
    const {title, content} = req.body;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me 6 questions (True/False/Not Given [Each type should appear on at least 1 questions]) [Answer should be "True", "False" or "Not Given". Write it in correct format ] IELTS Reading task (THE QUESTION SHOULD BE PARAPHASED) base on this paragraph : "${content}" with the title "${title}".
OUTPUT FORMAT:
[QUESTION 1]
[ANSWER 1]
[EXPLAINATION 1]
<END>
[QUESTION 2]
[ANSWER 2]
[EXPLAINATION 2]
<END>
....
[QUESTION 6]
[ANSWER 6]
[EXPALINATION 6]
<END>`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();

    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
    console.log(parsedEvaluation);
});

router.post('/generateReadingMCQOA', authenticateToken, async(req, res) => {
    const {title, content} = req.body;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me 6 questions of Multiple Choice Question (One Answer only, 4 Options[there should be no comma]) and corresponding answer [MUST WRITE IN CORRECT FORMAT, MUST HAVE [QUESTION x], [OPTION x], [ANSWER x] and [EXPLAINATION x]] for IELTS Reading task (THE QUESTION AND OPTION SHOULD BE PARAPHASED) base on this paragraph : "${content}" with the title "${title}. MUST HAVE THE [OPTION] TAG".
OUTPUT FORMAT:
[QUESTION 1]
[OPTION 1]
[OPTION 2]
[OPTION 3]
[OPTION 4]
[ANSWER 1]
[EXPLAINATION 1]
<END>
[QUESTION 2]
[OPTION 1]
[OPTION 2]
[OPTION 3]
[OPTION 4]
[ANSWER 2]
[EXPLAINATION 2]
<END>
....
[QUESTION 6]
[OPTION 1]
[OPTION 2]
[OPTION 3]
[OPTION 4]
[ANSWER 6]
[EXPLAINATION 6]
<END>`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    console.log(evaluation)
    const parsedEvaluation = parseEvaluationType2(evaluation);
    res.json(parsedEvaluation);
    console.log(parsedEvaluation);
});

router.post('/generateReadingMCQMA', authenticateToken, async(req, res) => {
    const {title, content} = req.body;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me 6 questions of Multiple Choice Question (AT LEAST TWO ANWER, FIVE or SIX Options[there should be no comma]) and corresponding answer [MUST WRITE IN CORRECT FORMAT, MUST HAVE [QUESTION x], [OPTION x], [ANSWER x] and [EXPLAINATION x]] for IELTS Reading task (THE QUESTION AND OPTION SHOULD BE PARAPHASED) base on this paragraph : "${content}" with the title "${title}. MUST HAVE THE [OPTION] TAG. MULTIPLE ANSWER, AT LEAST TWO ANSWER SEPERATED BY A COMMA, ANSWER SHOULD BE FULL TEXT FROM OPTIONS[]".
OUTPUT FORMAT:
[QUESTION 1]
[OPTION 1]
[OPTION 2]
[OPTION 3]
[OPTION 4]
[OPTION 5]
[OPTION 6]
[ANSWER 1]
[EXPLAINATION 1]
<END>
[QUESTION 2]
[OPTION 1]
[OPTION 2]
[OPTION 3]
[OPTION 4]
[OPTION 5]
[OPTION 6]
[ANSWER 2]
[EXPLAINATION 2]
<END>
....
[QUESTION 6]
[OPTION 1]
[OPTION 2]
[OPTION 3]
[OPTION 4]
[OPTION 5]
[OPTION 6]
[ANSWER 6]
[EXPLAINATION 6]
<END>`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    console.log(evaluation)
    const parsedEvaluation = parseEvaluationType2(evaluation);
    res.json(parsedEvaluation);
    console.log(parsedEvaluation);
});

router.post('/generateReadingFillOneWord', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `Generate 6 Fill in the Blanks (THE BLANK REPRESENT AS "........") question for IELTS READING TASK (ANSWER HAVE ONE WORD ONLY, 6 question SHOULD BE 6 OR MORE SENTENCE OF A PARAGRAPH) (question must be paraphased) (the given paragraph must contain answer word) with the following format: 
            [QUESTION 1]
            [ANSWER 1]
            [EXPLANATION 1]
            <END>
            [QUESTION 2]
            [ANSWER 2]
            [EXPLANATION 2]
            <END>
            ...
            [QUESTION 6]
            [ANSWER 6]
            [EXPLANATION 6]
            <END>
            based on the paragraph with title "${title}" and content "${content}"`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
});

router.post('/generateReadingFillTwoWords', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `Generate 6 Fill in the Blanks (THE BLANK REPRESENT AS "........") question for IELTS READING TASK (ANSWER HAVE NO MORE THAN TWO WORD ,AT LEAST ONE QUESTION HAVE AN ANSWER CONTAIN TWO WORDS, 6 question SHOULD BE 6 OR MORE SENTENCE OF A PARAGRAPH) (question must be paraphased) (THE GIVEN PARAGRAPH MUST CONTAIN ANSWER WORDS) with the following format: 
            [QUESTION 1]
            [ANSWER 1]
            [EXPLANATION 1]
            <END>
            [QUESTION 2]
            [ANSWER 2]
            [EXPLANATION 2]
            <END>
            ...
            [QUESTION 6]
            [ANSWER 6]
            [EXPLANATION 6]
            <END>
            based on the paragraph with title "${title}" and content "${content}"`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
});


router.post('/generateReadingMatchingHeading', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `Generate a Matching Heading problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            [OPTION 1]
            [OPTION 2]
            [OPTION 3]
            [OPTION 4]
            ...
            [OPTION 8]
            [QUESTION 1]
            Section 1
            [ANSWER 1]
            [EXPLANATION 1]
            <END>
            [QUESTION 2]
            Section 2
            [ANSWER 2]
            [EXPLANATION 2]
            <END>
            ...
            [QUESTION 6]
            Section 6
            [ANSWER 6]
            [EXPLANATION 6]
            <END>
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 QUESTION and 8 OPTIONS"`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    // console.log(evaluation)
    const parsedEvaluation = parseEvaluationType3(evaluation);
    res.json(parsedEvaluation);
});


router.post('/generateReadingMatchingParagraphInfo', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `Generate a Matching Paragraph Information problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            [OPTION 1]
            [OPTION 2]
            [OPTION 3]
            [OPTION 4]
            ...
            [OPTION 8]
            [QUESTION 1]
            Section 1
            [ANSWER 1]
            [EXPLANATION 1]
            <END>
            [QUESTION 2]
            Section 2
            [ANSWER 2]
            [EXPLANATION 2]
            <END>
            ...
            [QUESTION 6]
            Section 6
            [ANSWER 6]
            [EXPLANATION 6]
            <END>
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 QUESTION and 8 OPTIONS"`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    // console.log(evaluation)
    const parsedEvaluation = parseEvaluationType3(evaluation);
    res.json(parsedEvaluation);
});

router.post('/generateReadingMatchingFeatures', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `Generate a Matching Features problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            [OPTION 1]
            [OPTION 2]
            [OPTION 3]
            [OPTION 4]
            ...
            [OPTION 8]
            [FEATURE 1]
            [ANSWER 1]
            [EXPLANATION 1]
            <END>
            [FEATURE 2]
            [ANSWER 2]
            [EXPLANATION 2]
            <END>
            ...
            [FEATURE 6]
            [ANSWER 6]
            [EXPLANATION 6]
            <END>
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 FEATURE and 8 OPTIONS"`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    console.log(evaluation)
    const parsedEvaluation = parseEvaluationType4(evaluation);
    res.json(parsedEvaluation);
});

router.post('/generateReadingMatchingSentenceEnding', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `Generate a Matching Sentence Ending problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            [OPTION 1]
            [OPTION 2]
            [OPTION 3]
            [OPTION 4]
            ...
            [OPTION 8]
            [SENTENCE 1]
            [ANSWER 1]
            [EXPLANATION 1]
            <END>
            [SENTENCE 2]
            [ANSWER 2]
            [EXPLANATION 2]
            <END>
            ...
            [SENTENCE 6]
            [ANSWER 6]
            [EXPLANATION 6]
            <END>
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 SENTENCE and 8 OPTIONS (ENDING)"`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    console.log(evaluation)
    const parsedEvaluation = parseEvaluationType5(evaluation);
    res.json(parsedEvaluation);
});

module.exports = router;