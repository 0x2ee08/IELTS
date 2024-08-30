const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

router.post('/get_bloglist', authenticateToken, async (req, res) => {
    // const { username } = req.user;
    // const { prob_id } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`blogs`);

    const result = await blogsCollection.find({}, { projection: { title: 1, _id: 0 } }).toArray();
    const result2 = await blogsCollection.find({}, { projection: { blog_id: 1, _id: 0 } }).toArray();

    res.json({ idlist: result2, bloglist: result});
});

router.post('/get_class_list', async (req, res) => {
    const { school } = req.body;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`school_list`);

    const result = await tasksCollection.findOne({name: school});
    const lst = (result.class || []).sort();
    if (!result) return;

    res.json({id: result.insertedId, classlist: lst});
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

router.post('/add_school', async (req, res) => {
    const { role, newschool } = req.body;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`school_list`);

    const check = await tasksCollection.findOne({name: newschool});
    if(check) return res.status(400).json({ error: 'This school has already inserted' });

    if(role !== 'admin' && role !== 'teacher') {
        return res.status(400).json({ error: 'You have no permissions to do this.' });
    } 

    const result = await tasksCollection.insertOne({name: newschool, class: null});

    res.json({id: result.insertedId, result});
});

module.exports = router;