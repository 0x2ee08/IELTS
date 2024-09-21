'use client'; // Ensure this file is treated as a client component

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { useSearchParams, useParams } from 'next/navigation';
import config from '../../../config'; 
import '../../../VocabPage.css'; // Import a CSS file for styling

interface VocabEntry {
  word: string;
  phonetics: string;
  meaning: string;
}

interface Vocab {
  [key: string]: VocabEntry[];
}

const VocabPage: React.FC = () => {
  const [vocab, setVocab] = useState<Vocab>({});
  const { idContest } = useParams();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || '';

  useEffect(() => {
    const fetchVocab = async () => {
      if (idContest && title) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${config.API_BASE_URL}api/getVocab`,
            { idContest, title },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const fetchedVocab: Vocab = response.data;

          // Create a new vocab structure to filter distinct words
          const distinctVocab: Vocab = {};
          const seenWords = new Set<string>();

          for (const [level, entries] of Object.entries(fetchedVocab)) {
            const filteredEntries = entries.filter(entry => {
              const isNewWord = !seenWords.has(entry.word);
              if (isNewWord) seenWords.add(entry.word);
              return isNewWord;
            });

            if (filteredEntries.length > 0) {
              distinctVocab[level] = filteredEntries;
            }
          }

          setVocab(distinctVocab);

          // Set the default selected level to the first level
          if (Object.keys(distinctVocab).length > 0) {
            setSelectedLevel(Object.keys(distinctVocab)[0]);
          }
        } catch (error) {
          console.error('Error fetching vocab:', error);
        }
      } else {
        console.warn('idContest or title is missing.');
      }
    };

    fetchVocab();
  }, [idContest, title]);

  const [flipped, setFlipped] = useState<{ [key: string]: boolean }>({});

  const toggleFlip = (key: string) => {
    setFlipped(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      <Head>
        <title>Vocabulary for {title}</title>
      </Head>
      <Header />
      <main>
        <h1>Vocabulary for {title}</h1>
        <h2>
          <Link href={`/flashcards/contest/${idContest}/review?title=${encodeURIComponent(title)}`}>
            Review
          </Link>
        </h2>
        <div className="flashcard-container">
          {/* Navbar for level titles */}
          <div className="navbar bg-gray-100 p-4">
            <div className="flex space-x-4">
              {Object.keys(vocab).map((level) => (
                <button
                  key={level}
                  className={`px-4 py-2 text-sm font-bold transition-colors ${
                    selectedLevel === level
                      ? 'text-white bg-blue-500'
                      : 'text-blue-500 hover:bg-blue-100'
                  }`}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Check if the selected level exists and map over the words */}
          {selectedLevel && vocab[selectedLevel] && (
            <div className="flashcard-grid mt-4">
              {vocab[selectedLevel].map((entry, index) => {
                const cardKey = `${selectedLevel}-${index}`;
                return (
                  <div
                    key={cardKey}
                    className={`flashcard ${flipped[cardKey] ? 'flipped' : ''}`}
                    onClick={() => toggleFlip(cardKey)}
                  >
                    <div className="flashcard-front">
                      <div className="flashcard-word">
                        <strong>{entry.word}</strong>
                      </div>
                      <div className="flashcard-phonetics">
                        <em>({entry.phonetics})</em>
                      </div>
                    </div>
                    <div className="flashcard-back">{entry.meaning}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );  
};

export default VocabPage;
