// /pages/flashcards/review/[id].tsx

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useParams, useSearchParams } from 'next/navigation';
import config from '../../../config';
import '../style.css'; // Import CSS for review page styling

interface VocabEntry {
  word: string;
  phonetics: string;
  meaning: string;
}

const VocabReviewPage = () => {
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
          // just random apperance, demo 
            let vocabArray: VocabEntry[] = [];
            for (const level in response.data) {
                if (Array.isArray(response.data[level])) {
                    vocabArray = vocabArray.concat(response.data[level]); 
                }
            }
            shuffleArray(vocabArray);
            setVocab(vocabArray);
        } catch (error) {
          console.error('Error fetching vocab:', error);
        }
      }
    };

    fetchVocab();
  }, [idContest, title]);

  // Function to shuffle the array
  const shuffleArray = (array: VocabEntry[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const handleButtonClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % vocab.length); // Loop back to the start when out of cards
  };

  return (
    <>
      <Head>
        <title>Review Vocabulary for {title}</title>
      </Head>
      <Header />
      <main>
        <h1>Review Vocabulary for {title}</h1>
        {vocab.length > 0 && (
          <div className="card">
            <strong>{vocab[currentIndex].word}</strong>
            <em>({vocab[currentIndex].phonetics})</em>
            <p>{vocab[currentIndex].meaning}</p>
            <div className="buttons">
              <button onClick={handleButtonClick}>Easy</button>
              <button onClick={handleButtonClick}>Hard</button>
              <button onClick={handleButtonClick}>Skip</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default VocabReviewPage;
