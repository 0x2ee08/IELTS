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
    <div className="flex flex-col min-h-screen">
    <Header />
    <div className="ml-32 mr-32 mt-8">
      <h1 className="flex justify-center items-center text-4xl mb-2 text-[#03045E]"> Flash Card </h1>
      <ul>
        {paragraphs.map((paragraph) => (
          <li key={paragraph.idContest}>
            <Link
                href={`/flashcards/${paragraph.idContest}?title=${encodeURIComponent(paragraph.title)}`}
              >
            <div className="flex justify-between bg-white hover:bg-gray-100 border border-gray-500 rounded mb-2 p-2">
              <div>
                <h2>{paragraph.title}</h2>
                <p className='text-sm'>{paragraph.contestName}</p>
              </div>
              {/* Button for navigating to the next page */}
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
