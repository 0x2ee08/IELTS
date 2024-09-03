const express = require('express');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Save Note
router.post('/save_note', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { video_id, content } = req.body;
    const time_save = new Date();

    try {
        const db = await connectToDatabase();
        const noteCollection = db.collection('note');

        const newNote = {
            username: username,
            time_created: time_save,
            content: content
        };

        const result = await noteCollection.updateOne(
            { video_id: video_id },
            { $push: { content: newNote } },
            { upsert: true } // Ensure it creates the document if it doesn't exist
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            res.json({ success: true, message: 'Note saved!' });
        } else {
            res.status(404).json({ success: false, message: 'Video not found' });
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Note
router.delete('/delete_note', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { video_id } = req.body;

    try {
        const db = await connectToDatabase();
        const noteCollection = db.collection('note');

        const result = await noteCollection.updateOne(
            { video_id: video_id },
            { $pull: { content: { username: username } } }
        );

        if (result.modifiedCount > 0) {
            res.json({ success: true, message: 'Note deleted!' });
        } else {
            // Skipping the note deletion if it doesn't exist
            res.json({ success: true, message: 'No note to delete.' });
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Note
router.post('/get_note', authenticateToken, async (req, res) => {
    const { video_id } = req.body;
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const noteCollection = db.collection('note');

        const note = await noteCollection.findOne({ video_id: video_id, 'content.username': username });

        if (note) {
            res.json({ success: true, note: note });
        } else {
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
