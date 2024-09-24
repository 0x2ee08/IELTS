const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    const { username, email, name, school, class_, password, role, tokens } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (user) {
            if (user.username === username) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
            if (user.email === email) {
                return res.status(400).json({ error: 'Email is already registered' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne({ username, email, name, school, class_, password: hashedPassword, role, tokens, created_at: new Date() });
        res.json({ id: result.insertedId, username, email, name });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

module.exports = router;