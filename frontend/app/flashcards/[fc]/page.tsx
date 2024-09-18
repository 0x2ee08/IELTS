'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config'; 
import '../../VocabPage.css'; // Add a CSS file for styling

interface Flashcard {
  word: string;
  meaning: string;
}

export default function FlashcardPage() {
  const { fc } = useParams(); // Use useParams to access dynamic route parameters
  const [flashcardSet, setFlashcardSet] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<{ [key: number]: boolean }>({}); // Track flipped state for each card

  useEffect(() => {
    if (!fc) {
      console.log("fcID is missing or empty");
      return;
    }

    const fetchFlashcardSet = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}api/flashcards/${fc}`);
        const data = response.data;
        setTitle(data.title);
        setUserName(data.userName);
        setFlashcardSet(data.flashcards);
      } catch (error) {
        console.error('Error fetching flashcard set:', error);
        setError("Error fetching flashcard set.");
      }
    };

    fetchFlashcardSet();
  }, [fc]);

  const toggleFlip = (index: number) => {
    setFlipped(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="ml-32 mr-32 mt-8">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <h1 className="flex justify-center items-center text-4xl mb-4 text-[#03045E]">Flashcard Set: {title}</h1>
            <h2 className="text-lg mb-4">Created by: {userName}</h2>
            <div className="flashcard-container">
              {flashcardSet.map((flashcard, index) => (
                <div
                  key={index}
                  className={`flashcard ${flipped[index] ? 'flipped' : ''}`}
                  onClick={() => toggleFlip(index)}
                >
                  <div className="flashcard-front">
                    <strong>{flashcard.word}</strong>
                  </div>
                  <div className="flashcard-back">
                    {flashcard.meaning}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
