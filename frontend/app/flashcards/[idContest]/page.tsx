'use client'; // Ensure this file is treated as a client component

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useSearchParams, useParams } from 'next/navigation';
import config from '../../config'; 
import '../../VocabPage.css'; // Import a CSS file for styling

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
          setVocab(response.data);
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
        <div className="flashcard-container">
          {Object.entries(vocab).map(([level, words]) => (
            <div key={level}>
              <h2>{level}</h2>
              <div className="flashcard-row">
                {words.map((entry, index) => {
                  const cardKey = `${level}-${index}`;
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
                      <div className="flashcard-back">
                        {entry.meaning}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VocabPage;
