const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Multer setup for file upload

router.post('/upload_file_reading_statements', authenticateToken, async (req, res) => {
    const { topic, problem } = req.body;
    const db = await connectToDatabase();
    const problemsetCollection = db.collection('problemset');

    try {
        // upload a reading problem
        const result = await problemsetCollection.updateOne(
            { skill: "Reading", topic: topic },
            {
                $push: { problem: problem },
            },
            { upsert: true }  // Create document if it doesn't exist
        );

        res.json({ success: true, message: 'Uploaded!' });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
