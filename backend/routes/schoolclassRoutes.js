const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

router.post('/get_school_list', async (req, res) => {
    // const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`school_list`);

    const result = await tasksCollection.find({}).sort({ name: 1 }).toArray();

    res.json({id: result.insertedId, result});
});

router.post('/get_class_list', async (req, res) => {
    const { school } = req.body;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`school_list`);

    const result = await tasksCollection.findOne({name: school});
    if (!result) return;

    const lst = (result.class || []).sort();

    res.json({id: result.insertedId, classlist: lst});
});

router.post('/getAllStudent', authenticateToken, async(req, res) => {
    const {school, _class} = req.body;

    console.log(school, _class)

    const db = await connectToDatabase();
    const userCollection = db.collection(`users`);

    const querySnapshot = await userCollection
      .find({ school: school, class_: _class })
      .project({ username: 1 }) // Only return the username field
      .toArray();

    // Extract usernames
    const usernames = querySnapshot.map(user => user.username);

    // Join usernames into a string format
    return res.json({students: usernames.join(', ')}); 
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

router.post('/add_school',authenticateToken, async (req, res) => {
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