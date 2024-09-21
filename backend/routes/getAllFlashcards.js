// getAllFlashcards.js
const express = require('express');
const { connectToDatabase } = require('../utils/mongodb');
const router = express.Router();

// @route   GET /api/flashcards/getAllFlashcards
// @desc    Get all flashcard sets
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const flashCollection = db.collection('flashcards');
    const allFlashcards = await flashCollection.find({}).toArray();

    res.json(allFlashcards); // Return the flashcards
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ message: 'Error fetching flashcards' });
  }
});

module.exports = router;
