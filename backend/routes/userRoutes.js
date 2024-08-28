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

// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const accessToken = jwt.sign({ username: user.username, id: user._id, role: user.role }, secret);
        res.json({ accessToken, username: user.username, role: user.role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to login user' });
    }
});

// Get user info
router.get('/user', authenticateToken, async (req, res) => {
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ username }, { projection: { _id: 0, username: 1, email: 1, name: 1 } });
        if (!user) {
            return res.status(500).json({ error: 'Failed to get user info' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Update user info
router.post('/update_profile', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { name, school, class_, avatar } = req.body;
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { username: username },
            { 
                $set: { 
                    name: name, 
                    school: school, 
                    class_: class_, 
                    avatar: avatar 
                }
            }
        )

        res.json({ id: result.insertedId, result});
    } catch (error) {
        console.error('Error update user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

router.post('/change_password', async (req, res) => {
    // const { username } = req.user;
    const { email, newpassword } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newpassword)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.' });
    }
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const hashedPassword = await bcrypt.hash(newpassword, 10);
        const result = await usersCollection.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ error: 'Failed to update user info' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ error: 'Failed to update user info' });
    }
});

router.post('/get_data_profile', authenticateToken, async (req, res) => {
    const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`users`);

    const result = await tasksCollection.find({ username: username }).toArray();

    res.json({id: result.insertedId, result});
});

router.post('/get_school_list', async (req, res) => {
    // const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`school_list`);

    const result = await tasksCollection.find({}).toArray();

    res.json({id: result.insertedId, result});
});

router.post('/get_class_list', async (req, res) => {
    const { school } = req.body;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`school_list`);

    const result = await tasksCollection.findOne({name: school});

    res.json({id: result.insertedId, classlist: result.class});
});


module.exports = router;