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
    const evaluationArray = JSON.parse(evaluation);
    const evaluationObject = {};

    //evaluationArray.forEach((item, index) => {
    Object.keys(evaluationArray).forEach(key => {
        const item = evaluationArray[key];
        const questionIndex = key;
        evaluationObject[questionIndex] = {
            question: item.question.trim(),
            answer: item.answer.trim(),
            explanation: item.explaination.trim(),
        };
    });

    return evaluationObject;
}

function parseEvaluationType2(evaluation) {
    const evaluationArray = JSON.parse(evaluation);
    const evaluationObject = {};

    // evaluationArray.forEach((item, index) => {
        Object.keys(evaluationArray).forEach(key => {
        // const questionIndex = index + 1;
        const item = evaluationArray[key];
        const questionIndex = key;
        evaluationObject[questionIndex] = {
            question: item.question.trim(),
            options: item.options.map(option => option.trim()),
            answer: item.answer.trim(),
            explanation: item.explaination.trim(),
        };
    });

    return evaluationObject;
}

function parseEvaluationType3(evaluationString) {
    // First, parse the evaluation string into an object
    const evaluation = JSON.parse(evaluationString);

    // Create the result object structure
    const evaluationObject = {
        options: [],
    };

    // Extract options
    if (evaluation.options) {
        evaluationObject.options = evaluation.options;
    }

    // Extract sections (e.g., "Section 1", "Section 2", etc.)
    Object.keys(evaluation).forEach(key => {
        if (key.startsWith("Section")) {
            const sectionIndex = Number(key.split(" ")[1]); // Convert section number to a number
            const section = evaluation[key];
            evaluationObject[sectionIndex] = {
                question: key,
                answer: section.answer,
                explanation: section.explaination // Note: Typo "explaination" is retained as per input
            };
        }
    });

    return evaluationObject;
}

function parseEvaluationType4(evaluationString) {
    // First, parse the evaluation string into an object
    const evaluation = JSON.parse(evaluationString);

    // Create the result object structure
    const evaluationObject = {
        options: [],
    };

    // Extract options
    if (evaluation.options) {
        evaluationObject.options = evaluation.options;
    }

    Object.keys(evaluation).forEach(key => {
        if (key.startsWith("Feature")) {
            const sectionIndex = Number(key.split(" ")[1]); // Convert section number to a number
            const section = evaluation[key];
            evaluationObject[sectionIndex] = {
                question: section.question,
                answer: section.answer,
                explanation: section.explaination // Note: Typo "explaination" is retained as per input
            };
        }
    });

    return evaluationObject;
}

function parseEvaluationType5(evaluationString) {
    // First, parse the evaluation string into an object
    const evaluation = JSON.parse(evaluationString);

    // Create the result object structure
    const evaluationObject = {
        options: [],
    };

    // Extract options
    if (evaluation.options) {
        evaluationObject.options = evaluation.options;
    }

    Object.keys(evaluation).forEach(key => {
        if (key.startsWith("Sentence")) {
            const sectionIndex = Number(key.split(" ")[1]); // Convert section number to a number
            const section = evaluation[key];
            evaluationObject[sectionIndex] = {
                question: section.question,
                answer: section.answer,
                explanation: section.explaination // Note: Typo "explaination" is retained as per input
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
{
    "1": {
        "question": "question 1",
        "answer": "answer 1",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "question 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "question 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}

OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections.`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", ""); 

    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
});

router.post('/generateReadingTFNG', authenticateToken, async(req, res) => {
    const {title, content} = req.body;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me 6 questions (True/False/Not Given [Each type should appear on at least 1 questions]) [Answer should be "True", "False" or "Not Given". Write it in correct format ] IELTS Reading task (THE QUESTION SHOULD BE PARAPHASED) base on this paragraph : "${content}" with the title "${title}".
OUTPUT FORMAT:
{
    "1": {
        "question": "question 1",
        "answer": "answer 1",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "question 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "question 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}

OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections.`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
    console.log(evaluation);
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
{
    "1": {
        "question": "question 1",
        "options": ["option 1.1", "option 1.2", ..., "option 1.4"]
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "2": {
        "question": "question 2",
        "options": ["option 2.1", "option 2.2", ..., "option 2.4"]
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "6": {
        "question": "question 6",
        "options": ["option 6.1", "option 6.2", ..., "option 6.4"]
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}

OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections.`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
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
{
    "1": {
        "question": "question 1",
        "options": ["option 1.1", "option 1.2", ..., "option 1.6"]
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "2": {
        "question": "question 2",
        "options": ["option 2.1", "option 2.2", ..., "option 2.6"]
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "6": {
        "question": "question 6",
        "options": ["option 6.1", "option 6.2", ..., "option 6.6"]
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}

OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections.`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
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
            content: `[LEVEL: HARD/INSANE] Generate 6 Fill in the Blanks (THE BLANK REPRESENT AS "........") question for IELTS READING TASK (ANSWER HAVE ONE WORD ONLY, 6 question SHOULD BE 6 OR MORE SENTENCE OF A PARAGRAPH) (question must be paraphased) (the given paragraph must contain answer word) with the following format: 
{
    "1": {
        "question": "sentence 1, with the missing word replaced with ........ Note: exactly EIGHT dots",
        "answer": "answer 1 [WORD MUST OCCUR IN THE PARAGRAPH]",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "sentence 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "sentence 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}

            based on the paragraph with title "${title}" and content "${content}
            
            OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections."`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
});

router.post('/generateReadingFillTwoWords', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `[LEVEL: HARD/INSANE] Generate 6 Fill in the Blanks (THE BLANK REPRESENT AS "........") question for IELTS READING TASK (ANSWER HAVE NO MORE THAN TWO WORD ,AT LEAST ONE QUESTION HAVE AN ANSWER CONTAIN TWO WORDS, 6 question SHOULD BE 6 OR MORE SENTENCE OF A PARAGRAPH) (question must be paraphased) (THE GIVEN PARAGRAPH MUST CONTAIN ANSWER WORDS) with the following format: 
            OUTPUT FORMAT:
{
    "1": {
        "question": "sentence 1, with the missing word(s) replaced with ........ Note: exactly EIGHT dots",
        "answer": "answer 1 Note: [WORD(s) MUST OCCUR IN THE PARAGRAPH]",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "sentence 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "sentence 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}
            based on the paragraph with title "${title}" and content "${content}
            
            OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections."`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
    const parsedEvaluation = parseEvaluationType1(evaluation);
    res.json(parsedEvaluation);
});


router.post('/generateReadingMatchingHeading', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{
            role: 'system',
            content: `[LEVEL: HARD/INSANE] Generate a Matching Heading problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            {
                "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
                "Section 1": {
                    "answer": "answer 1",
                    "explaination": "explaination 1"
                },
                "Section 2": {
                    "answer": "answer 2",
                    "explaination": "explaination 2"
                },
                ...
                "Section 6": {
                    "answer": "answer 6",
                    "explaination": "explaination 6"
                }
            }
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 QUESTION and 8 OPTIONS
            
            OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections."`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
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
            content: `[LEVEL: HARD/INSANE] Generate a Matching Paragraph Information problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            {
                "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
                "Section 1": {
                    "answer": "answer 1",
                    "explaination": "explaination 1"
                },
                "Section 2": {
                    "answer": "answer 2",
                    "explaination": "explaination 2"
                },
                ...
                "Section 6": {
                    "answer": "answer 6",
                    "explaination": "explaination 6"
                }
            }
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 QUESTION and 8 OPTIONS
            
            OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections."`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
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
            content: `[LEVEL: HARD/INSANE] Generate a Matching Features problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            {
                "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
                "Feature 1": {
                    "question": "feature 1",
                    "answer": "answer 1",
                    "explaination": "explaination 1"
                },
                "Feature 2": {
                    "question": "feature 2",
                    "answer": "answer 2",
                    "explaination": "explaination 2"
                },
                ...
                "Feature 6": {
                    "question": "feature 6",
                    "answer": "answer 6",
                    "explaination": "explaination 6"
                }
            }
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 FEATURE and 8 OPTIONS
            Option is a/an object/person... in the paragraph. Question is the action/apperance a/an object/person did/have in the paragraph
            OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections."`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
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
            content: `[LEVEL: HARD/INSANE] Generate a Matching Sentence Ending problem for IELTS READING TASK (Answer should be exactly the same as what in the options)  [OPTION SHOULD BE IN RANDOM ORDER, EVERYTHING MUST BE PARAPHASED] (MUST OUTPUT THE CORRECT FORMAT, HAVE [OPTION], [QUESTION] and [ANSWER] tag) with the following format: 
            {
                "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
                "Sentence 1": {
                    "question": "opening sentence 1",
                    "answer": "answer 1",
                    "explaination": "explaination 1"
                },
                "Sentence 2": {
                    "question": "opening sentence 2",
                    "answer": "answer 2",
                    "explaination": "explaination 2"
                },
                ...
                "Sentence 6": {
                    "question": "opening sentence 6",
                    "answer": "answer 6",
                    "explaination": "explaination 6"
                }
            }
            based on the paragraph with title "${title}" and content "${content}. THERE SHOULD BE 6 SENTENCE and 8 OPTIONS (ENDING)
            Question is the first part of the sentence. Options contain possible choice for the last part of the sentence. If we combine the first part (question) and last part (options) correctly, we get a full, have meaning, grammar correct sentence.
            OUTPUT MUST BE CORRECT JSON FORMAT. The question, answer, (options) MUST be STRONGLY paraphased from paragraph and can (MUST) cause mistake for participant if not reading carefully. question can ask about the data in the middle of each sections, not neccessary the whole sections."`
        }],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    evaluation = evaluation.replace("```json", "").replace("```", "");
    console.log(evaluation)
    const parsedEvaluation = parseEvaluationType5(evaluation);
    res.json(parsedEvaluation);
});

module.exports = router;