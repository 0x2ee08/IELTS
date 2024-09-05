'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import config from '../config'; // Adjust the path to your config file

interface Paragraph {
  idContest: string;
  title: string;
  contestName: string;
}

export default function Paragraphs() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);

  useEffect(() => {
    const fetchParagraphs = async () => {
      try { 
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}api/getAllParagraph`, { headers: { 'Authorization': `Bearer ${token}` } });
        setParagraphs(response.data);
      } catch (error) {
        console.error('Error fetching paragraphs:', error);
      }
    };

    fetchParagraphs();
  }, []);

  return (
    <>
      <Header />
      <main>
        <h1>Available Paragraphs</h1>
        <ul>
          {paragraphs.map(paragraph => (
            <li key={paragraph.idContest}>
              <Link
                href={`/flashcards/${paragraph.idContest}?title=${encodeURIComponent(paragraph.title)}`}
              >
                {paragraph.title} - {paragraph.contestName}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
