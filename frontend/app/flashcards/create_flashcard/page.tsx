// C:/IELTS/frontend/app/flashcards/create_flashcard/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import from next/navigation
import axios from 'axios';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import config from '../../config'; // Adjust the path to your config

interface Flashcard {
  word: string;
  meaning: string;
}

export default function CreateFlashcard() {
  const [title, setTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([{ word: '', meaning: '' }]);
  const router = useRouter(); 

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { word: '', meaning: '' }]);
  };

  const handleFlashcardChange = (index: number, field: string, value: string) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[index][field as keyof Flashcard] = value;
    setFlashcards(updatedFlashcards);
  };

  const handleFinished = async () => {
    if (!title || !userName || flashcards.some(fc => !fc.word || !fc.meaning)) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}api/flashcards/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, userName, flashcards }),
    });
    const result = await response.json();

      // Redirect to the new flashcard page using `[fc]`
      router.push(`/flashcards/${result.id}`);
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      alert("There was an error creating your flashcard.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="ml-32 mr-32 mt-8">
        <h1 className="flex justify-center items-center text-4xl mb-4 text-[#03045E]">Create Flashcard</h1>

        <div className="mb-4">
          <label className="block text-lg mb-2">Title of your flashcard:</label>
          <input
            type="text"
            className="border border-gray-500 p-2 w-full rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of your flashcard set"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg mb-2">Your Name:</label>
          <input
            type="text"
            className="border border-gray-500 p-2 w-full rounded"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <h2 className="text-lg mb-2">Flashcard Entries:</h2>
        {flashcards.map((flashcard, index) => (
          <div key={index} className="mb-4">
            <div className="mb-2">
              <input
                type="text"
                className="border border-gray-500 p-2 w-full rounded"
                value={flashcard.word}
                onChange={(e) => handleFlashcardChange(index, 'word', e.target.value)}
                placeholder="Word"
              />
            </div>
            <div>
              <input
                type="text"
                className="border border-gray-500 p-2 w-full rounded"
                value={flashcard.meaning}
                onChange={(e) => handleFlashcardChange(index, 'meaning', e.target.value)}
                placeholder="Meaning"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleAddFlashcard}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Add more
        </button>

        <button
          onClick={handleFinished}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Finished
        </button>
      </div>
      <Footer />
    </div>
  );
}