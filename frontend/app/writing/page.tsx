'use client'

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config'; // Assuming you have a config file for API_BASE_URL

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [statements, setStatements] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Function to upload file and extract statements
  const extractStatements = async () => {
    const token = localStorage.getItem('token'); // Get the token from localStorage

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${config.API_BASE_URL}api/import_file_writing_statements`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data.statements;
      setStatements(result);
    } catch (err) {
      console.error('Error extracting statements:', err);
      setError('An error occurred while extracting the statements.');
      setStatements([]); // Clear statements on error
    } finally {
      setLoading(false);
    }

    console.log(statements)
  };

  const uploadStatements = async () => {
    const token = localStorage.getItem('token');
  
    // Explicitly type the function parameters and return value
    const chunkArray = (array: string[], chunkSize: number): string[][] => {
      const chunks: string[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    };
  
    const statementChunks = chunkArray(statements, 10);  // Split statements into chunks of 10
  
    try {
      // Send each chunk in a separate request sequentially
      for (const chunk of statementChunks) {
        await axios.post(`${config.API_BASE_URL}api/upload_file_writing_statements`, { statements: chunk }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      console.log('All statements uploaded successfully.');
    } catch (error) {
      console.error('Error uploading statements:', error);
    }
  };
  
  
  const uploadingProblems = async() => {
    extractStatements()
    uploadStatements()
  }
  return (
    <div className="App">
      <h1>Upload a Text File to Extract Statements</h1>

      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadingProblems} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Extracted Statements</h2>
      <ul>
        {statements.map((statement, index) => (
          <li key={index}>{statement}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
