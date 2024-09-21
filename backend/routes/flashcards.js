const express = require('express');
const router = express.Router();

let flashcards = []; // In-memory storage for flashcards
let currentId = 1; // To track the current flashcard ID

// @route   POST /api/flashcards
// @desc    Create a new flashcard set
router.post('/create_new_', (req, res) => {
  const { title, userName, flashcards: newFlashcards } = req.body;

  if (!title || !userName || !newFlashcards || !newFlashcards.length) {
    return res.status(400).json({ message: 'Invalid data provided' });
  }

  const newFlashcardSet = {
    id: currentId++,
    title,
    userName,
    flashcards: newFlashcards,
  };

  flashcards.push(newFlashcardSet);

  res.status(201).json(newFlashcardSet);
});

// @route   GET /api/flashcards/:id
// @desc    Get a specific flashcard set by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const flashcardSet = flashcards.find(fc => fc.id === id);

  if (!flashcardSet) {
    return res.status(404).json({ message: 'Flashcard set not found' });
  }

  res.json(flashcardSet);
});

// @route   GET /api/flashcards/getAllFlashcards
// @desc    Get all flashcard sets
router.get('/getAllFlashcards', (req, res) => {
  res.json(flashcards);
});

module.exports = router;
