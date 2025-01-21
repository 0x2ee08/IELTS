const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/mongodb');

const router = express.Router();

router.post('/upload_reading_problem', authenticateToken, async (req, res) => {
    const { topic, paragraph } = req.body;
    
    // Check if the topic and paragraph data are valid
    if (!topic || !paragraph || !paragraph.title || !paragraph.content) {
        return res.status(400).json({ error: 'Topic, title, or content is missing.' });
    }

    try {
        const db = await connectToDatabase();
        const problemSetCollection = db.collection('problemset');

        // Find the existing document by skill ("reading") and topic
        const existingDoc = await problemSetCollection.findOne({ skill: 'reading', topic });

        if (existingDoc) {
            // If the document already exists, add the new paragraph to the existing 'statements' array
            await problemSetCollection.updateOne(
                { skill: 'Reading', topic },
                { $push: { statements: paragraph } } // Use $push to add the new paragraph to the array
            );
            return res.json({ success: true, message: 'Paragraph added to existing topic.' });
        } else {
            // If the document does not exist, create a new document
            const newDoc = {
                skill: 'reading',
                topic,
                statements: [paragraph], // Add the new paragraph as the first statement
            };
            await problemSetCollection.insertOne(newDoc);
            return res.json({ success: true, message: 'New topic created with paragraph.' });
        }
    } catch (error) {
        console.error('Error uploading problem:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


module.exports = router;
