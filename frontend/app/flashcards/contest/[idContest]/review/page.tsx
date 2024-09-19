'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { useParams, useSearchParams } from 'next/navigation';
import config from '../../../../config';
import '../style.css'; // Import CSS for review page styling

interface VocabEntry {
  word: string;
  phonetics: string;
  meaning: string;
}

const VocabReviewPage = () => {
  const [vocabLevels, setVocabLevels] = useState<VocabEntry[][]>([]);
  const [currentIndices, setCurrentIndices] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(2);
  const [interactionList, setInteractionList] = useState<VocabEntry[]>([]);
  const [paused, setPaused] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [incorrectList, setIncorrectList] = useState<VocabEntry[]>([]);

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

          console.log('API response data:', response.data);

          if (typeof response.data === 'object' && response.data !== null) {
            const vocab: VocabEntry[][] = Object.values(response.data) as VocabEntry[][];

            vocab.forEach((level) => shuffleArray(level));

            setVocabLevels(vocab);

            setCurrentIndices(vocab.map(() => 0));
          } else {
            console.error('Unexpected response data format:', response.data);
          }

        } catch (error) {
          console.error('Error fetching vocab:', error);
        }
      }
    };

    fetchVocab();
  }, [idContest, title]);

  const shuffleArray = (array: VocabEntry[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const handleButtonClickEasy = () => {
    addToInteractionList();
    if (currentLevel < vocabLevels.length - 2 && vocabLevels[currentLevel + 1].length > 0) {
      setCurrentLevel((prevLevel) => Math.max(prevLevel + 1, 0));
    }
    updateCurrentIndex();
  };

  const handleButtonClickHard = () => {
    addToInteractionList();
    if (currentLevel > 0 && vocabLevels[currentLevel - 1].length > 0) {
      setCurrentLevel((prevLevel) => Math.min(prevLevel - 1, vocabLevels.length - 1));
    }
    updateCurrentIndex();
  };

  const handleButtonClickSkip = () => {
    updateCurrentIndex();
  };

  const handleButtonClickPause = () => {
    setPaused(true);
    setQuizIndex(0);
  };

  const updateCurrentIndex = () => {
    setCurrentIndices((prevIndices) => {
      let newIndices = [...prevIndices];
      newIndices[currentLevel]++;

      if (newIndices[currentLevel] >= vocabLevels[currentLevel].length) {
        let found = false;
        for (let i = 1; i < vocabLevels.length; i++) {
          const nextLevel = (currentLevel + i) % vocabLevels.length;
          if (newIndices[nextLevel] < vocabLevels[nextLevel].length) {
            setCurrentLevel(nextLevel);
            found = true;
            break;
          }
        }

        if (!found) {
          newIndices = vocabLevels.map(() => 0);
          setCurrentLevel(0);
        }
      }

      return newIndices;
    });
  };

  const addToInteractionList = () => {
    const currentWord = vocabLevels[currentLevel][currentIndices[currentLevel]];
    setInteractionList((prevList) => [...prevList, currentWord]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleSubmitAnswer = () => {
    const currentWord = interactionList[quizIndex];
    if (userAnswer.trim().toLowerCase() === currentWord.meaning.toLowerCase()) {
      setFeedback('Correct!');
    } else {
      setFeedback(`Incorrect!\nCorrect answer: ${currentWord.meaning}`);
      setIncorrectList((prevList) => [...prevList, currentWord]);
    }
    setUserAnswer('');
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    setFeedback('');
    setShowNextButton(false);
    if (quizIndex < interactionList.length - 1) {
      setQuizIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizIndex(-1); // Indicate completion
    }
  };

  return (
    <>
      <Head>
        <title>Review Vocabulary for {title}</title>
      </Head>
      <Header />
      <main>
        <h1>Review Vocabulary for {title}</h1>
        {!paused ? (
          vocabLevels[currentLevel]?.[currentIndices[currentLevel]] && (
            <div className="card">
              <strong className='text-5xl'>{vocabLevels[currentLevel][currentIndices[currentLevel]].word}</strong>
              <em className='text-2xl'>({vocabLevels[currentLevel][currentIndices[currentLevel]].phonetics})</em>
              <div className="buttons">
                <button onClick={handleButtonClickEasy}>Easy</button>
                <button onClick={handleButtonClickHard}>Hard</button>
                <button onClick={handleButtonClickSkip}>Skip</button>
                <button onClick={handleButtonClickPause}>Pause</button>
              </div>
            </div>
          )
        ) : quizIndex >= 0 ? (
          <div className="quiz">
            <div>
              <strong className='text-5xl'>{interactionList[quizIndex].word}</strong>
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={handleInputChange}
              placeholder="Type your answer"
            />
            <button onClick={handleSubmitAnswer} disabled={showNextButton}>Submit</button>
            <p style={{ whiteSpace: "pre-wrap" }}>{feedback}</p>
            {showNextButton && <button onClick={handleNextQuestion}>Next Question</button>}
          </div>
        ) : (
          <div>
            <h2>Incorrect Words</h2>
            <ul>
              {incorrectList.map((entry, index) => (
                <li key={index}>
                  {entry.word}: {entry.meaning}
                </li>
              ))}
            </ul>
            <h2>Well done!</h2>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default VocabReviewPage;