const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Multer setup for file upload

// POST /upload - Upload a text file and extract statements into a string array
router.post('/upload_file_writing_statements', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const data = fs.readFileSync(filePath, 'utf8'); // Read file content

        // Split the content by newlines and filter out empty lines
        const statementsArray = data.split(/\r?\n/).filter(Boolean);

        // Return the extracted statements as a string array in the response
        res.status(200).json({
            message: 'Statements extracted successfully',
            statements: statementsArray,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    } finally {
        // Cleanup: remove the uploaded file after processing
        if (req.file) fs.unlinkSync(req.file.path);
    }
});

module.exports = router;
