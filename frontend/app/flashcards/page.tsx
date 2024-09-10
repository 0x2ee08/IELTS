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
      {paragraphs.map((paragraph) => (
        <li key={paragraph.idContest}>
          <div className="paragraph-card">
            <h2>{paragraph.title}</h2>
            <p>{paragraph.contestName}</p>
            {/* Button for navigating to the next page */}
            <Link
              href={`/flashcards/${paragraph.idContest}?title=${encodeURIComponent(paragraph.title)}`}
            >
              <button className="view-button">View Paragraph</button>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  </main>
  <Footer />

  <style jsx>{`
    body {
      background-color: #e0f5fc;
      font-family: 'Arial', sans-serif;
    }

    main {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      color: #004e63;
    }

    h1 {
      font-size: 2.5rem;
      color: #004e63;
      margin-bottom: 1.5rem;
    }

    ul {
      list-style-type: none;
      padding: 0;
      width: 100%;
      max-width: 800px;
    }

    li {
      background: white;
      margin: 1rem 0;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    li:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .paragraph-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    h2 {
      font-size: 1.5rem;
      color: #004e63;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 1rem;
      color: #2596be;
      margin-bottom: 1rem;
    }

    .view-button {
      background-color: #2596be;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .view-button:hover {
      background-color: #207c9c;
    }

    a {
      text-decoration: none;
      color: inherit;
    }
  `}</style>
</>

  );
}
