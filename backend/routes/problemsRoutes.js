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

router.post('/getProblem', authenticateToken, async (req, res) => {
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

module.exports = router;