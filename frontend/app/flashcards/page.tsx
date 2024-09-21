'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import config from '../config'; // Adjust the path to your config file

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
  const [flashcardsVisible, setFlashcardsVisible] = useState(3); // Start by showing 4 flashcards
  const [paragraphsVisible, setParagraphsVisible] = useState(3); // Start by showing 4 paragraphs

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}api/getAllFlashcards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFlashcards(response.data);
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

  const showMoreFlashcards = () => setFlashcardsVisible(flashcardsVisible + 3);
  const showMoreParagraphs = () => setParagraphsVisible(paragraphsVisible + 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="ml-32 mr-32 mt-8">
        {error && <div className="text-red-500">{error}</div>} {/* Show error message */}

        {/* Flashcards Section */}
        <h1 className="flex justify-center items-center text-4xl mb-2 text-[#03045E]">All Flashcards</h1>
        <h2 className="mb-4 flex justify-left">
          <Link href={`/flashcards/create_flashcard`}>
            <button className="bg-[#0077b6] text-white font-bold py-2 px-4 rounded shadow hover:bg-[#0096db] transition duration-300">
              Create your own flashcard
            </button>
          </Link>
        </h2>
        {flashcards.length > 0 ? (
          <ul>
            {flashcards.slice(0, flashcardsVisible).map((flashcard) => (
              <li key={flashcard.id}>
                <Link href={`/flashcards/${flashcard.id}?title=${encodeURIComponent(flashcard.title)}`}>
                  <div className="flex justify-between bg-white hover:bg-gray-100 border border-gray-500 rounded mb-2 p-2">
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
              className="text-sm underline text-gray-600 hover:text-gray-800"
              onClick={showMoreFlashcards}
            >
              Show More
            </button>
          </div>
        )}

        {/* Paragraphs Section */}
        <h1 className="flex justify-center items-center text-4xl mb-2 mt-10 text-[#03045E]">All Paragraphs</h1>
        <ul>
          {paragraphs.slice(0, paragraphsVisible).map((paragraph) => (
            <li key={paragraph.idContest}>
              <Link href={`/flashcards/contest/${paragraph.idContest}?title=${encodeURIComponent(paragraph.title)}`}>
                <div className="flex justify-between bg-white hover:bg-gray-100 border border-gray-500 rounded mb-2 p-2">
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
              className="text-sm underline text-gray-600 hover:text-gray-800"
              onClick={showMoreParagraphs}
            >
              Show More
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
