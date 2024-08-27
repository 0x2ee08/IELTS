const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
// const { MODEL_NAME, OPENROUTER_API_KEY, SPEAKING_MODEL, SPEAKING_KEY } = require('../config/config');
const { secret } = require('../config/config');
const router = express.Router();

// upload to MongoDB
router.post('/save_to_database', async (req, res) => {
    const { test } = req.body;
    // const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`test`);

    // const result = await tasksCollection.insertOne({ user, created_by: username});
    const result = await tasksCollection.insertOne({ test });

    res.json({ id: result.insertedId});
});

// download from MongoDB
router.post('/get_data', async (req, res) => {
    const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`test`);

    const result = await tasksCollection.find({ created_by: username }).toArray();

    res.json({id: result.insertedId, result});
});

module.exports = router;