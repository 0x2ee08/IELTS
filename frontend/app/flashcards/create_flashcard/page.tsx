'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import config from '../../config';

interface Flashcard {
  word: string;
  meaning: string;
}

export default function CreateFlashcard() {
  const [title, setTitle] = useState(''); 
  const [userName, setUserName] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([{ word: '', meaning: '' }]);
  
  const [itemsPerPage, setItemsPerPage] = useState(5);  // Default items per page
  const [currentPage, setCurrentPage] = useState(1);    // Default to page 1
  
  const router = useRouter();

  const debounceTime = 300; // Adjust as necessary
  const [lastClickTime, setLastClickTime] = useState(0);

  const [pressedButton, setPressedButton] = useState(null); // Track which button is pressed

  const handleMouseDown = (buttonName: any) => {
    setPressedButton(buttonName);
  };

  const handleMouseUp = () => {
    setPressedButton(null);
  };

  const handleAddFlashcard = () => {
    setTimeout(() => {
      setFlashcards([{ word: '', meaning: '' }, ...flashcards]);
    }, 200); // 200ms delay
  };

  const handleResetFlashcards = () => {
    setFlashcards([{ word: '', meaning: '' }]); 
    setTitle(''); 
    setUserName(''); 
  };

  const handleFinished = async () => {
    if (!title || !userName || flashcards.some(fc => !fc.word || !fc.meaning)) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}api/flashcards/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, userName, flashcards }),
      });
      const result = await response.json();

      router.push(`/flashcards/${result.id}`);
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      alert("There was an error creating your flashcard.");
    }
  };

  // Pagination logic
  const handleChangeItemsPerPage = (value: any) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to page 1 whenever items per page changes
  };

  // Pagination logic
  const totalFlashcards = flashcards.length;
  const totalPages = Math.ceil(totalFlashcards / itemsPerPage);
  const paginatedFlashcards = flashcards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFlashcardChange = (index: number, field: string, value: string) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[index][field as keyof Flashcard] = value;
    setFlashcards(updatedFlashcards);
  };

  const handleDeleteFlashcard = (index: number) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards);
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
        
        <div className="flex space-x-4 mb-4">
          <button
            onMouseDown={() => handleMouseDown('add')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleAddFlashcard}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-transform duration-200 ${pressedButton === 'add' ? 'scale-90' : 'scale-100'} hover:bg-blue-700`}
          >
            Add word
          </button>

          <button
            onMouseDown={() => handleMouseDown('reset')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleResetFlashcards}
            className={`px-4 py-2 bg-gray-500 text-white rounded-md transition-transform duration-200 ${pressedButton === 'reset' ? 'scale-90' : 'scale-100'} hover:bg-gray-600`}
          >
            Reset all forms
          </button>

          <button
            onMouseDown={() => handleMouseDown('finished')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleFinished}
            className={`px-4 py-2 bg-green-500 text-white rounded-md transition-transform duration-200 ${pressedButton === 'finished' ? 'scale-90' : 'scale-100'} hover:bg-green-600`}
          >
            Finished
          </button>
        </div>
    
        {/* Items per page selection */}
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">Flashcards per page:</label>
          <select
            className="border border-gray-500 p-2 rounded"
            value={itemsPerPage}
            onChange={(e) => handleChangeItemsPerPage(parseInt(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Flashcards List */}
        <div className="flex flex-col space-y-4 mb-4">
          {paginatedFlashcards.map((flashcard, index) => (
            <div key={index} className="border border-gray-500 p-4 rounded-md">
              <div className="flex mb-2">
                <input
                  type="text"
                  value={flashcard.word}
                  onChange={(e) => handleFlashcardChange(index, 'word', e.target.value)}
                  placeholder="Word"
                  className="border border-gray-400 p-2 rounded w-full mr-2"
                />
                <input
                  type="text"
                  value={flashcard.meaning}
                  onChange={(e) => handleFlashcardChange(index, 'meaning', e.target.value)}
                  placeholder="Meaning"
                  className="border border-gray-400 p-2 rounded w-full"
                />
              </div>
              <button
                onClick={() => handleDeleteFlashcard(index)}
                className="mt-2 bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`bg-gray-300 text-black px-4 py-2 rounded-md transition duration-300 ease-in-out 
              ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
          >
            Previous
          </button>

          <input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const value = Math.max(1, Math.min(parseInt(e.target.value), totalPages));
              setCurrentPage(isNaN(value) ? currentPage : value);
            }}
            min={1}
            max={9999}
            className="w-16 text-center border border-gray-500 p-1 rounded"
          />

          <span className="text-lg font-semibold">of {totalPages}</span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`bg-gray-300 text-black px-4 py-2 rounded-md transition duration-300 ease-in-out 
              ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
