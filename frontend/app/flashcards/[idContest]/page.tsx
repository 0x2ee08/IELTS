'use client'; // Ensure this file is treated as a client component

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useSearchParams, useParams } from 'next/navigation'; // Use this for route and query parameters
import config from '../../config'; // Adjust the path to your config file

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
  const { idContest } = useParams(); // Access dynamic segment
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || '';

  useEffect(() => {
    console.log('Search params:', searchParams.toString()); // Log all search params
    console.log('idContest:', idContest); // Log idContest
    console.log('title:', title); // Log title

    const fetchVocab = async () => {
      if (idContest && title) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(`${config.API_BASE_URL}api/getVocab`, {
            idContest,
            title
          },
          { headers: { 'Authorization': `Bearer ${token}` } });
          console.log('Vocab response:', response.data);
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

  return (
    <>
      <Head>
        <title>Vocabulary for {title}</title>
      </Head>
      <Header />
      <main>
        <h1>Vocabulary for {title}</h1>
        <ul>
          {Object.entries(vocab).map(([level, words]) => (
            <li key={level}>
              <h2>{level}</h2>
              <ul>
                {words.map((entry, index) => (
                  <li key={index}>
                    <strong>{entry.word}</strong> <em>({entry.phonetics})</em>: {entry.meaning}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
};

export default VocabPage;
