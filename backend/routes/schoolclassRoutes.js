const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

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
    if (!result) return;

    res.json({id: result.insertedId, classlist: result.class});
});

router.post('/update_class_list', async (req, res) => {
    // const { username } = req.user;
    const { school, classlist } = req.body;
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('school_list');

        const result = await usersCollection.updateOne(
            { name: school },
            { $set: { class: classlist } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ error: 'Not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ error: 'Failed to update class list' });
    }
});

module.exports = router;