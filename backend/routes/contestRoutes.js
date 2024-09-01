const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY
const router = express.Router();

router.post('/createContest', authenticateToken, async (req, res) => {
    const { type, accessUser, startTime, endTime, problemName,  paragraphs} = req.body;

    const db = await connectToDatabase();
    const contestCollection = db.collection(`contest`);

    console.log(paragraphs)

    res.json({"Status" : "Success"});
});

module.exports = router;