const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Multer setup for file upload

// Helper function to parse file content into topics and statements
function parseFileContent(content) {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const parsedData = [];
    let currentTopic = null;
    let currentStatements = [];

    lines.forEach(line => {
        if (line.endsWith(':')) {
            // Save the previous topic and its statements if any
            if (currentTopic && currentStatements.length) {
                parsedData.push({ topic: currentTopic.slice(0, -1), statements: currentStatements });
            }
            // Start a new topic
            currentTopic = line.trim();
            currentStatements = [];
        } else if (currentTopic && line.trim()) {
            // Add statements under the current topic
            currentStatements.push(line.trim());
        }
    });

    // Push the last topic and its statements
    if (currentTopic && currentStatements.length) {
        parsedData.push({ topic: currentTopic.slice(0, -1), statements: currentStatements });
    }

    return parsedData;
}

// POST /import_file_writing_statements - Upload a text file and extract topics and statements
router.post('/import_file_writing_statements', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const data = fs.readFileSync(filePath, 'utf8'); // Read file content

        // Parse the file content
        const parsedTopics = parseFileContent(data);

        // Return the extracted data in the response
        res.status(200).json({
            message: 'Statements extracted successfully',
            topics: parsedTopics,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    } finally {
        // Cleanup: remove the uploaded file after processing
        if (req.file) fs.unlinkSync(req.file.path);
    }
});

// POST /upload_file_writing_statements - Save parsed topics and statements to the database
router.post('/upload_file_writing_statements', authenticateToken, async (req, res) => {
    const { topic, statement } = req.body;
    const db = await connectToDatabase();
    const problemsetCollection = db.collection('problemset');

    try {
        // Insert each statement under the specified topic
        const result = await problemsetCollection.updateOne(
            { skill: "Writing", topic: topic },
            {
                $push: { statements: statement },
            },
            { upsert: true }  // Create document if it doesn't exist
        );

        res.json({ success: true, message: 'Statement uploaded successfully!' });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
