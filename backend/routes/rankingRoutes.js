const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

// User registration
router.post('/getUsersScore', async (req, res) => {
    const { id } = req.body;

    try {
        const db = await connectToDatabase();
        const rankingCollection = db.collection('ranking');

        const rankingData = await rankingCollection.findOne({ id });

        res.json({users: rankingData.data});
    } catch (error) {
        console.error('Error fetching ranking data:', error);
        res.status(500).json({ error: 'Failed to fetch ranking data' });
    }
});

router.post('/getUserRankingDetail', async (req, res) => {
    const { username } = req.body;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username });
        const { name, class_, school } = user;
        res.json({ name, class_, school });
        
    } catch (error) {
        console.error('Error fetching ranking data:', error);
        res.status(500).json({ error: 'Failed to fetch ranking data' });
    }
});

module.exports = router;