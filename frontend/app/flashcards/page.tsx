'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import config from '../config'; // Adjust the path to your config file
import '../flashcards/style.css';

interface Flashcard {
  id: string;
  title: string;
  userName: string;
}

interface Paragraph {
  idContest: string;
  title: string;
  contestName: string;
}

export default function FlashcardsAndParagraphs() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [error, setError] = useState('');
  const [flashcardsVisible, setFlashcardsVisible] = useState(3); // Start by showing 3 flashcards
  const [paragraphsVisible, setParagraphsVisible] = useState(3); // Start by showing 3 paragraphs

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}api/getAllFlashcards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Reverse the flashcards array here after fetching
        setFlashcards(response.data.reverse());
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        setError('Failed to load flashcards');
      }
    };

    const fetchParagraphs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found in localStorage.');
          return;
        }

        const response = await axios.get(`${config.API_BASE_URL}api/getAllParagraph`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParagraphs(response.data);
      } catch (error) {
        console.error('Error fetching paragraphs:', error);
        setError('Failed to load paragraphs');
      }
    };

    fetchFlashcards();
    fetchParagraphs();
  }, []);

  const [pressedButton, setPressedButton] = useState(null); // Track which button is pressed
  const handleMouseDown = (buttonName: any) => {
    setPressedButton(buttonName);
  };
  const handleMouseUp = () => {
    setPressedButton(null);
  };

  const showMoreFlashcards = () => setFlashcardsVisible(flashcardsVisible + 3);
  const showMoreParagraphs = () => setParagraphsVisible(paragraphsVisible + 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="ml-32 mr-32 mt-8">
        {error && <div className="text-red-500">{error}</div>} {/* Show error message */}

        {/* Flashcards Section */}
        <div className="flashcards-section">
          <h1 className="section-header text-4xl mb-8 text-[#03045E]">All Flashcards</h1>
          <div className="mb-6 flex justify-left">
            <Link href={`/flashcards/create_flashcard`}>
              <button
                onMouseDown={() => handleMouseDown('create-your-own-flashcard')}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`create-flashcard-btn relative overflow-hidden bg-[#0077b6] text-white font-bold py-2 px-4 rounded shadow hover:bg-[#0096db] transition duration-300 ripple-effect ${pressedButton === 'create-your-own-flashcard' ? 'scale-90' : 'scale-100'}`}
              >
                Create your own flashcard
              </button>
            </Link>
          </div>
          {flashcards.length > 0 ? (
            <ul className="flashcard-list">
              {flashcards.slice(0, flashcardsVisible).map((flashcard) => (
                <li key={flashcard.id}>
                  <Link href={`/flashcards/${flashcard.id}?title=${encodeURIComponent(flashcard.title)}`}>
                    <div
                      onMouseDown={() => handleMouseDown(`${flashcard.title}${flashcard.userName}`)}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className={`card flex justify-between bg-white hover:bg-gray-100 border border-gray-500 rounded-lg mb-4 p-4 transition-transform duration-200 ease-out`}
                      style={{
                        transform: pressedButton === `${flashcard.title}${flashcard.userName}` ? 'scale(0.98, 0.97)' : 'scale(1, 1)',
                      }}
                    >
                      <div>
                        <h2>{flashcard.title}</h2>
                        <p className="text-sm">Created by: {flashcard.userName}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No flashcards available.</p>
          )}
          {flashcardsVisible < flashcards.length && (
            <div className="flex justify-left mt-4">
              <button
                className="load-more-btn text-sm underline text-gray-600 hover:text-gray-800"
                onClick={showMoreFlashcards}
              >
                Show More
              </button>
            </div>
          )}
        </div>

        {/* Paragraphs Section */}
        <div className="paragraphs-section">
          <h1 className="section-header text-4xl mb-8 text-[#03045E]">All Paragraphs</h1>
          <ul className="paragraph-list">
            {paragraphs.slice(0, paragraphsVisible).map((paragraph) => (
              <li key={paragraph.idContest}>
                <Link href={`/flashcards/contest/${paragraph.idContest}?title=${encodeURIComponent(paragraph.title)}`}>
                  <div
                    onMouseDown={() => handleMouseDown(`${paragraph.idContest}${paragraph.contestName}`)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`card flex justify-between bg-white hover:bg-gray-100 border border-gray-500 rounded-lg mb-4 p-4 transition-transform duration-200 ease-out`}
                    style={{
                      transform: pressedButton === `${paragraph.idContest}${paragraph.contestName}` ? 'scale(0.98, 0.97)' : 'scale(1, 1)',
                    }}
                  >
                    <div>
                      <h2>{paragraph.title}</h2>
                      <p className="text-sm">{paragraph.contestName}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {paragraphsVisible < paragraphs.length && (
            <div className="flex justify-left mt-4">
              <button
                className="load-more-btn text-sm underline text-gray-600 hover:text-gray-800"
                onClick={showMoreParagraphs}
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
