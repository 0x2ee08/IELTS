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
        //userAnswer: [],
    });

    res.json({ success: true, message: 'Problem created successfully' });
});

router.post('/getSpeakingLexicalResource', authenticateToken, async (req, res) => {
    const { question, answer } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `For this question: ${question}. Give me ielts band and improvement about lexical resources of this answer: ${answer} based on the following conditions:
            a) Identify Vocabulary Range
            - Assess variety: Does the candidate use a wide range of vocabulary, or do they repeat simple words frequently?
            - Check for advanced vocabulary: Look for less common or topic-specific words that go beyond basic everyday language. For example, instead of just saying "big," do they use words like "enormous" or "massive"?
            - Use of collocations: Look for appropriate word combinations (e.g., "take responsibility," "heavy traffic").
            b) Evaluate Paraphrasing Ability
            - Rephrasing: Can the candidate express the same idea in different ways, using a variety of words and structures? Paraphrasing is an important skill to avoid repetition and show versatility.
            - Synonyms: Does the candidate demonstrate an ability to use synonyms effectively? For instance, can they switch between "important" and "crucial" when needed?
            c) Idiomatic and Phrasal Verb Usage
            - Idioms and phrases: Look for the natural and correct use of idiomatic expressions (e.g., "raining cats and dogs") and phrasal verbs (e.g., "give up," "put off"). The use of such expressions should enhance the natural flow of speech, not sound forced or unnatural.
            - Cultural appropriateness: Check whether idiomatic expressions are used appropriately according to the situation.
            d) Examine Word Formation and Flexibility
            - Word forms: Are different forms of the same word used correctly? For example, "beautiful" (adjective), "beauty" (noun), or "beautify" (verb). 
            - Flexibility in use: Is the candidate able to adapt their vocabulary to different topics? Can they talk about both familiar and unfamiliar topics using appropriate vocabulary?

            Band 9 (Expert)
            - Uses a wide range of vocabulary fluently and accurately.
            - Demonstrates full flexibility in paraphrasing.
            - Uses idiomatic language naturally and appropriately.
            - No mistakes in word choice or collocations.
            Band 8 (Very Good)
            - Uses a wide range of vocabulary with only occasional errors.
            - Can convey precise meanings and show a strong ability to paraphrase.
            - Occasionally makes minor errors with idiomatic expressions, but they do not affect meaning.
            Band 7 (Good)
            - Varied vocabulary with some awareness of less common words.
            - Able to discuss both familiar and unfamiliar topics with appropriate vocabulary.
            - Occasionally uses words inappropriately or makes mistakes in word choice but generally paraphrases well.
            Band 6 (Competent)
            - Uses an adequate range of vocabulary to discuss familiar and some unfamiliar topics.
            - Attempts to paraphrase but sometimes lacks flexibility.
            - Makes some errors in word choice that may slightly affect meaning.
            Band 5 (Modest)
            - Uses a limited range of vocabulary; relies heavily on simple words.
            - Struggles to paraphrase; often repeats words and phrases.
            - Makes frequent errors in word choice or context that can affect meaning.
            - Band 4 (Limited)
            - Basic vocabulary is used, and the candidate has difficulty expressing ideas.
            - Repetition of words and errors are frequent, causing confusion.
            - Very limited ability to paraphrase.
            Band 3 (Extremely Limited)
            -Can only use very basic vocabulary and has serious difficulty conveying meaning.
            - Errors are constant, and communication is severely hindered.

            Only give me the result, no title, opening, or anything else\n
            Give me the ielts band of original answer first\n
            Then, check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
            For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
            [BAND]: {number} [E]: word1 [word2](correct_word2 - suggest_word2) word3...\n
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
            a) Evaluate Grammatical Range
            - Sentence structures: Does the candidate use a variety of sentence structures, or are they stuck using mostly simple sentences (e.g., "I like it because it’s nice.")?
            - Complex structures: Look for complex sentences that include conjunctions (e.g., "although," "because," "which"), conditional sentences, relative clauses, and subordinate clauses. For example, "I enjoy traveling because it allows me to experience new cultures."
            - Variety in tenses: Does the candidate use different tenses effectively (e.g., present, past, future, continuous, perfect)?
            b) Check for Grammatical Accuracy
            - Errors in structure: Identify the frequency of grammatical errors. These can include:
                +) Incorrect verb tense (e.g., using past instead of present).
                +) Misuse of subject-verb agreement (e.g., "She go" instead of "She goes").
                +) Errors in word order (e.g., "He tomorrow will come" instead of "He will come tomorrow").
            - Impact on meaning: Do the errors affect comprehension? A minor error may not interfere with communication, but consistent errors can cause confusion.
            c) Assess Sentence Flexibility
            - Simple vs. complex: Determine how often the candidate uses only simple sentences (e.g., "I like it. It is fun.") compared to complex structures (e.g., "I like it because it's fun and it allows me to learn new things.").
            - Balance between structures: Look for a good balance between simple and complex sentences. The candidate should not use only one type; variation shows control and flexibility.
            d) Tense Control
            - Range of tenses: Does the candidate use a variety of tenses accurately? For example, using the past tense to talk about past events (e.g., "Yesterday, I went to the park") and the future tense to talk about future plans (e.g., "I will visit my family next week").
            - Consistency: Are tenses consistently correct, or does the candidate mix tenses incorrectly within sentences (e.g., "Yesterday I go to the park")?
            e) Use of Clauses
            - Subordinate clauses: Look for sentences that use subordinate clauses (e.g., "If I had known, I would have gone," "The book that I read was interesting"). The use of clauses indicates an ability to handle more complex grammar.
            - Relative clauses: Look for sentences that include relative clauses (e.g., "The man who is sitting there is my friend").
            f) Check for Consistency
            - Consistency of accuracy: Determine whether grammatical accuracy is consistent throughout the test or if errors become more frequent as the candidate speaks for longer.
            - Consistency in complexity: Can the candidate consistently produce complex structures, or do they revert to simpler forms under pressure?
            
            Band 9 (Expert)
            - Uses a wide range of grammatical structures accurately and fluently.
            - Consistently produces error-free sentences.
            - Shows full control of complex structures, tenses, and clauses.
            - Band 8 (Very Good)
            - Uses a wide range of structures with only occasional errors.
            - Demonstrates good control of complex sentence structures.
            - Errors are rare and do not affect meaning.
            Band 7 (Good)
            - Varied sentence structures, including complex sentences.
            - Makes occasional grammatical mistakes, but they rarely affect communication.
            - Good range of tenses and some use of subordinate clauses, but there may be some inaccuracy in more complex areas.
            Band 6 (Competent)
            - Mix of simple and complex structures, but some awkwardness or mistakes in more complex ones.
            - Errors are more frequent but do not seriously impede understanding.
            - Limited use of subordinate clauses or complex structures.
            Band 5 (Modest)
            - Uses basic sentence structures with some attempts at complex sentences, often resulting in errors.
            - Makes frequent grammatical mistakes that can affect meaning.
            - Limited tense control and errors in structures are common.
            Band 4 (Limited)
            - Relies heavily on simple sentences.
            - Frequent errors in basic grammar that cause misunderstandings.
            - Rare use of complex structures.
            Band 3 (Extremely Limited)
            - Uses only very simple structures with frequent errors.
            - Grammar mistakes are constant and severely affect communication.

            Only give me the result, no title, opening, or anything else\n
            Give me the ielts band of original answer first\n
            Check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
            For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
            [BAND]: {number} [E]: word1 [word2](correct_word2 - suggest_word2) word3... \n
            -Because word1 and word3 are correct while word2 is not correct`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

router.post('/getSpeakingTaskResponse', authenticateToken, async (req, res) => {
    const { question, answer } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `For this question: ${question}. Give me ielts band and improvement about grammar of this answer: ${answer}
            a) Assess How Well the Candidate Addresses the Question
            - Understanding the prompt: Does the candidate fully understand the question and provide relevant answers, or do they go off-topic?
            - Complete response: Does the candidate answer all parts of the question?
            - Development of ideas: Are the ideas clearly explained and developed? A candidate should elaborate on their ideas with examples, reasons, or supporting details, rather than providing brief or vague responses.
            b) Evaluate the Logical Organization of Ideas
            - Coherence: Is the candidate able to organize their ideas in a logical, clear manner? This means their responses should flow smoothly from one point to another.
            - Structure: Look for a clear beginning, middle, and end in their answers. For instance, they should introduce the idea, provide details or examples, and conclude or connect to the next point.
            - Transitions: Are linking words or phrases used to connect ideas (e.g., "Firstly," "In addition," "However")? Effective use of these phrases enhances the flow of speech.
            c) Check for Relevance and Focus
            - Staying on topic: Does the candidate consistently answer the question, or do they go off-topic at times? It’s important that the answer remains focused on the task given.
            - Avoiding repetition: Look for any unnecessary repetition of ideas. If a candidate repeats the same point without adding anything new, it may suggest a lack of fluency or development in their response.
            d) Assess the Depth of Response
            - Depth of explanation: Does the candidate provide just basic responses, or do they go into greater depth by offering explanations, justifications, and examples?
            - Examples and support: Candidates should support their points with examples or personal experiences where appropriate. For instance, if talking about "Why people enjoy traveling," they should explain and provide reasons like "exploring new cultures" or "experiencing different cuisines."

            Band 9 (Expert)
            - Fully addresses all parts of the task with relevant and well-developed responses.
            - Organizes ideas in a clear, logical, and coherent way with appropriate transitions.
            - Ideas are fully extended and supported with relevant details and examples.
            - Fluent with no noticeable hesitation.
            Band 8 (Very Good)
            - Addresses all parts of the task well, with relevant responses that are mostly well-developed.
            - Coherent and logically organized answers, though there may be rare lapses in clarity or flow.
            - Ideas are supported with relevant examples, though there may be slight room for more depth.
            - Fluent, with very few hesitations or pauses.
            Band 7 (Good)
            - Addresses the task effectively, though some parts may be less fully developed.
            - Organizes ideas logically with generally good use of linking words and transitions.
            - Responses are relevant and on-topic but could benefit from more support and detail in places.
            - Mostly fluent, with occasional hesitations but no major disruptions to coherence.
            Band 6 (Competent)
            - Partially addresses the task, but some ideas may not be fully developed or clear.
            - Ideas are presented with some structure, but the organization may be inconsistent, with less effective use of linking words.
            - Some ideas are underdeveloped or too simple; more detail and examples are needed.
            - Hesitations and pauses may sometimes interrupt fluency, but the response is generally coherent.
            Band 5 (Modest)
            - Limited response to the task, with several parts of the question not addressed or insufficiently developed.
            - Weak structure, with some disjointed ideas and a lack of effective transitions.
            - Basic ideas are repeated without sufficient development or support.
            - Hesitations and pauses are frequent, affecting coherence and fluency.
            Band 4 (Limited)
            - Fails to adequately address the task, providing mostly irrelevant or incomplete responses.
            - Ideas are poorly organized with frequent confusion and lack of structure.
            - Very little development of ideas; responses are too brief or off-topic.
            - Frequent long pauses and hesitations break the fluency and make responses hard to follow.
            Band 3 (Extremely Limited)
            - Provides very limited or irrelevant responses.
            - Ideas are disjointed and difficult to follow, with minimal coherence.
            - Very brief responses, with little or no development.
            - Constant pauses and hesitations severely disrupt fluency.

            Only give me the result, no title, opening, or anything else\n
            Give me the ielts band of original answer first\n
            You need to return:\n
            [BAND]: {number} {errors + suggestions} \n`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    res.json({content: response.data.choices[0].message.content.trim()});
});

module.exports = router;