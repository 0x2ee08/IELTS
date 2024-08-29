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

    res.json({id: result.insertedId, classlist: result.class});
});


module.exports = router;