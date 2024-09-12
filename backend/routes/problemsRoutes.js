const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

router.post('/get_problemlist', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('problem');

        const result = await problemsCollection.find({}, { projection: { problem_id: 1, _id: 0 } })
            .sort({ time_created: -1 })
            .toArray();

        res.json({ problemlist: result });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/get_problem_type', authenticateToken, async (req, res) => {
    const { problem_id } = req.body;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('problem');

        const result = await problemsCollection.findOne({problem_id: problem_id}, { projection: { type: 1,_id: 0 } })

        res.json({ type: result.type });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/getSpeakingProblem', authenticateToken, async (req, res) => {
    const { problem_id } = req.body;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('problem');

        const result = await problemsCollection.findOne({problem_id: problem_id})

        res.json({ task: result.taskArray });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/getSpeakingAnswer', authenticateToken, async (req, res) => {
    const { problem_id } = req.body;
    const { username } = req.user;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('problem');

        const result = await problemsCollection.findOne({problem_id: problem_id})
        const userAnswer = result.userAnswer.find(answer => answer.username === username);

        res.json({ answer: userAnswer });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/add_new_speaking_answer', authenticateToken, async (req, res) => {
    const { problem_id, result, task_id } = req.body;
    const { username } = req.user;
    const time_created = new Date();

    try {
        const db = await connectToDatabase();
        const problemCollection = db.collection('problem');

        const problem = await problemCollection.findOne({ problem_id });
        const userAnswerIndex = problem.userAnswer.findIndex(answer => answer.username === username);

        if (userAnswerIndex === -1) {
            await problemCollection.updateOne(
                { problem_id },
                {
                    $push: {
                        userAnswer: {
                            username,
                            result: [{ ...result, task_id, time_created }]
                        }
                    }
                }
            );
        } else {
            await problemCollection.updateOne(
                { problem_id, 'userAnswer.username': username },
                {
                    $push: {
                        'userAnswer.$.result': { ...result, task_id, time_created }
                    }
                }
            );
        }

        res.json({ success: true, message: 'Answer updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;