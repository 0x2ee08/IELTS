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
  creator: string; // Assuming the API returns the creator's name
}

interface Paragraph {
  idContest: string;
  title: string;
  contestName: string;
}

export default function FlashcardsAndParagraphs() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);

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
      }
    };

    const fetchParagraphs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}api/getAllParagraph`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Paragraphs data:', response.data); // Debugging
        setParagraphs(response.data);
      } catch (error) {
        console.error('Error fetching paragraphs:', error);
      }
    };

    fetchFlashcards();
    fetchParagraphs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="ml-32 mr-32 mt-8">
        {/* Flashcards Section */}
        <h1 className="flex justify-center items-center text-4xl mb-2 text-[#03045E]">All Flashcards</h1>
        <h2 className="mb-4">
          <Link href={`/flashcards/create_flashcard`}>Create your own flashcard</Link>
        </h2>
        <ul>
          {flashcards.map((flashcard) => (
            <li key={flashcard.id}>
              <Link href={`/flashcards/${flashcard.id}?title=${encodeURIComponent(flashcard.title)}`}>
                <div className="flex justify-between bg-white hover:bg-gray-100 border border-gray-500 rounded mb-2 p-2">
                  <div>
                    <h2>{flashcard.title}</h2>
                    <p className="text-sm">Created by: {flashcard.creator}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Paragraphs Section */}
        <h1 className="flex justify-center items-center text-4xl mb-2 mt-10 text-[#03045E]">All Paragraphs</h1>
        <ul>
          {paragraphs.map((paragraph) => (
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
      </div>
      <Footer />
    </div>
  );
}
