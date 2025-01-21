const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Multer setup for file upload

router.post('/upload_file_reading_statements', authenticateToken, async (req, res) => {
    const { paragraphs } = req.body;
    const db = await connectToDatabase();
    const paragraphsCollection = db.collection('problemset');

    try {
        // Loop through each paragraph and insert/update it in the collection
        const operations = paragraphs.map((paragraph) => ({
            updateOne: {
                filter: { title: paragraph.title },
                update: { $set: paragraph },
                upsert: true, // Create document if it doesn't exist
            },
        }));

        // Perform bulk write for better efficiency
        const result = await paragraphsCollection.bulkWrite(operations);

        res.json({ success: true, message: 'Paragraphs uploaded successfully!', result });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
