const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/mongodb');

const router = express.Router();

router.post('/upload_reading_problem', authenticateToken, async (req, res) => {
    const { topic, paragraph } = req.body;

    // Validate input
    if (!topic) {
        return res.status(400).json({ error: 'Topic is missing.' });
    }
    if (!paragraph) {
        return res.status(400).json({ error: 'Paragraph object is missing.' });
    }
    if (!paragraph.title || !paragraph.content) {
        return res.status(400).json({ error: 'Paragraph title or content is missing.' });
    }

    try {
        const db = await connectToDatabase();
        const problemSetCollection = db.collection('problemset');

        // Find the existing document by skill ("Reading") and topic
        const existingDoc = await problemSetCollection.findOne({ skill: 'Reading', topic });

        if (existingDoc) {
            // Add the new paragraph to the 'problems' array
            await problemSetCollection.updateOne(
                { skill: 'Reading', topic },
                { $push: { problems: paragraph } }
            );
            return res.json({ success: true, message: 'Paragraph added to the existing topic.' });
        } else {
            // Create a new document
            const newDoc = {
                skill: 'Reading',
                topic,
                problems: [paragraph],
            };
            await problemSetCollection.insertOne(newDoc);
            return res.json({ success: true, message: 'New topic created with the paragraph.' });
        }
    } catch (error) {
        console.error('Error uploading paragraph:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
