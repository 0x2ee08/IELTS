const express = require('express');
const { connectToDatabase } = require('../utils/mongodb');
const router = express.Router();

let flashcards = []; // In-memory storage for flashcards

// Helper function to generate random string IDs
function randstring() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const length = 7;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

// @route   POST /api/flashcards
// @desc    Create a new flashcard set
router.post('/', async (req, res) => {
  const { title, userName, flashcards: newFlashcards } = req.body;

  if (!title || !userName || !newFlashcards || !newFlashcards.length) {
    return res.status(400).json({ message: 'Invalid data provided' });
  }

  const id = randstring(); // Use the random string as ID
  const newFlashcardSet = {
    id,
    title,
    userName,
    flashcards: newFlashcards,
  };

  flashcards.push(newFlashcardSet); // Save in-memory

  // Optionally, save in MongoDB
  try {
    const db = await connectToDatabase();
    const flashCollection = db.collection('flashcards');
    await flashCollection.insertOne(newFlashcardSet);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Error saving to database' });
  }

  res.status(201).json(newFlashcardSet);
});

// @route   GET /api/flashcards/:id
// @desc    Get a specific flashcard set by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Get the flashcard set ID from the URL params

  // Try to find the flashcard in in-memory storage
  const flashcardSet = flashcards.find(fc => fc.id === id);

  // Optionally, fetch from MongoDB if not found in memory
  if (!flashcardSet) {
    try {
      const db = await connectToDatabase();
      const flashCollection = db.collection('flashcards');
      const dbFlashcardSet = await flashCollection.findOne({ id });

      if (!dbFlashcardSet) {
        return res.status(404).json({ message: 'Flashcard set not found' });
      }

      return res.json(dbFlashcardSet);
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error fetching from database' });
    }
  }

  res.json(flashcardSet);
});

module.exports = router;
