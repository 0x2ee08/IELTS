'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Reading.css';
import { time } from 'console';
import axios from 'axios';
import config from '../../config';
import { useRouter } from 'next/navigation';

const ReadingContest = ({ contest }: { contest: any }) => {
    const [activeParagraph, setActiveParagraph] = useState(0);
    const [initialState, setInitialState] = useState(true);
    const initialTime = 60 * 60; // 60 minutes in seconds
    const router = useRouter();

    const [timeLeft, setTimeLeft] = useState<number>(initialTime);

    useEffect(() => {
        setInitialState(true);
    }, []);

    useEffect(() => {
        if(!initialState) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(timer); // Stop the timer when time is up
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
    
            return () => clearInterval(timer); // Cleanup interval on component unmount
        }
    }, [initialState]);

    const handleInitialState = () => {
        setInitialState(false);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    };



    const [userAnswers, setUserAnswers] = useState<any>(() => {
        // Try to get stored answers from the cookie when the component mounts
        const savedAnswers = Cookies.get('readingContestAnswers-' + contest.id);
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    });
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    // Update window height dynamically on resize
    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save updated answers to cookie every time user updates the answer
    const saveAnswersToCookie = (updatedAnswers: any) => {
        Cookies.set('readingContestAnswers-' + contest.id, JSON.stringify(updatedAnswers), { expires: 7 });
    };

    const handleParagraphSwitch = (index: number) => {
        setActiveParagraph(index);
    };

    const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: string) => {
        const updatedAnswers = { ...userAnswers };
        if (!updatedAnswers[activeParagraph]) updatedAnswers[activeParagraph] = {};
        if (!updatedAnswers[activeParagraph][sectionIndex]) updatedAnswers[activeParagraph][sectionIndex] = {};
        updatedAnswers[activeParagraph][sectionIndex][questionIndex] = value;
        setUserAnswers(updatedAnswers);
        saveAnswersToCookie(updatedAnswers); // Save answers to cookie after updating state
    };

    const handleSubmit = () => {
        saveAnswersToCookie(userAnswers); // Ensure the latest answers are saved

        const token = localStorage.getItem('token');
        axios.post(`${config.API_BASE_URL}api/submit_contest_reading`, 
            { contestID: contest.id, answer: userAnswers},
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            router.push('/results/' + response.data.submitID);
            saveAnswersToCookie({});
        })
        .catch(error => alert('Error!'))
        .finally(() => {
        });
    };
    function integerToRoman(num: number): string {
        const romanMap: { [key: number]: string } = {
            0: '',
            1: 'i',
            2: 'ii',
            3: 'iii',
            4: 'iv',
            5: 'v',
            6: 'vi',
            7: 'vii',
            8: 'viii',
            9: 'ix',
            10: 'x',
            11: 'xi',
            12: 'xii',
            13: 'xiii',
            14: 'xiv',
            15: 'xv'
        };
    
        return romanMap[num];
    }
    
    const replaceDotsWithTextarea = (sectionIndex: number, questionIndex: number, content: string): JSX.Element[] => {
        const parts = content.split('........');
        return parts.flatMap((part, index) => (
          index < parts.length - 1
            ? [<span key={index}>{part}</span>, <input 
            key={index + '_textarea'}
            className="border-0 border-b-2 border-black focus:border-black focus:outline-none text-center"
            value={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || ''}
            onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
            ></input>]
            : [<span key={index}>{part}</span>]
        ));
      };

    const renderTrueFalseNotGiven = (sectionIndex: number, questionIndex: number) => (
        <select 
            value={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || ''}
            onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}>
            {['','True', 'False', 'Not Given'].map((option: string, oIndex: number) => (
                <option key={oIndex} value={option}>{option}</option>
            ))}
        </select>
    );

    const renderYesNoNotGiven = (sectionIndex: number, questionIndex: number) => (
        ['','Yes', 'No', 'Not Given'].map((option: string) => (
            <label key={option}>
                <input
                    type="radio"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] === option}
                    onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
                /> {option}
            </label>
        ))
    );

    const renderMatchingTable = (section: any) => {
        return <div className='flex justify-center items-center'>
                    <div className="matching-table"> 
                        <div className="flex flex-col">
                            <p className='flex justify-center items-center'>List of things</p>
                            {section.options.map((option: string, index: number) => (
                            <p> {integerToRoman(index+1)}. {option}</p>
                            ))}
                        </div>
                    </div>
                </div>
    };

    const renderMatchingType = (sectionIndex: number, questionIndex: number, section: any) => {
        const newmap = ['', ...section.options];
        console.log(newmap); 
    
        return (
            <select
                value={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || ''}
                onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
            >
                {newmap.map((option: string, oIndex: number) => (
                    <option key={oIndex} value={option}>
                        {integerToRoman(oIndex)}
                    </option>
                ))}
            </select>
        );
    };
    
    
    const renderMultipleChoiceOneAnswer = (sectionIndex: number, questionIndex: number, section: any) => (
        section.questions[questionIndex].options.split(',').map((option: string) => (
            <label key={option.trim()}>
                <input
                    type="radio"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option.trim()}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] === option.trim()}
                    onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}
                /> {option.trim()}
            </label>
        ))
    );
    
    const renderMultipleChoiceMultipleAnswer = (sectionIndex: number, questionIndex: number, section: any) => (
        section.questions[questionIndex].options.split(',').map((option: string) => (
            <label key={option.trim()}>
                <input
                    type="checkbox"
                    name={`question-${sectionIndex}-${questionIndex}`}
                    value={option.trim()}
                    checked={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex]?.includes(option.trim())}
                    onChange={(e) => {
                        const updatedValue = userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || [];
                        const newValue = updatedValue.includes(option.trim()) 
                            ? updatedValue.filter((opt: string) => opt !== option.trim())
                            : [...updatedValue, option.trim()];
                        handleAnswerChange(sectionIndex, questionIndex, newValue);
                    }}
                /> {option.trim()}
            </label>
        ))
    );    

    const textRef = useRef<HTMLDivElement>(null);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  
  const buttonStyles: { [key: string]: React.CSSProperties } = {
    'yellow': { background: 'yellow' },
    'lightgreen': { background: 'lightgreen'},
    'lightblue': { background: 'lightblue' },
    'white': { background: 'white' },
  };

  const checkSelection = () => {
    const selection = window.getSelection();
    const textContent = textRef.current?.innerText.trim() || '';

    // If text is empty, hide highlight
    if (textContent === '') {
      setIsHighlighting(false);
      setHighlightPosition(null);
      return;
    }

    // If no selection or range is empty, hide highlight
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && !selection.isCollapsed) {
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setIsHighlighting(true);
      } else {
        setIsHighlighting(false);
        setHighlightPosition(null);
      }
    } else {
      setIsHighlighting(false);
      setHighlightPosition(null);
    }
  };

  const applyHighlight = async (color: string) => {
    if (textRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.extractContents();
  
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        
        selectedText.childNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'SPAN') {
            const innerText = (node as HTMLElement).innerText;
            span.appendChild(document.createTextNode(innerText));
          } else {
            span.appendChild(node.cloneNode(true));
          }
        });
        range.deleteContents();
        range.insertNode(span);
        mergeAdjacentSpans(span);
        selection.removeAllRanges();
        checkSelection();
      }
    }
  };

  const mergeAdjacentSpans = (span: HTMLElement) => {
    const prevSibling = span.previousSibling;
    const nextSibling = span.nextSibling;
  
    if (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) {
      const prevElement = prevSibling as HTMLElement;
      if (prevElement.tagName === 'SPAN' && prevElement.style.backgroundColor === span.style.backgroundColor) {
        prevElement.innerHTML += span.innerHTML;
        span.remove();
        span = prevElement;
      }
    }
  
    if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
      const nextElement = nextSibling as HTMLElement;
      if (nextElement.tagName === 'SPAN' && nextElement.style.backgroundColor === span.style.backgroundColor) {
        span.innerHTML += nextElement.innerHTML;
        nextElement.remove();
      }
    }
  };
  
  // Event handlers for mouse and keyboard events
  const handleMouseUp = () => checkSelection();
  const handleKeyUp = () => checkSelection();

  // Add and clean up event listeners
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

    let cnt=0;
    console.log(contest);
    return (
        <>
        <div className="reading-contest-page">
            {initialState && <div className="overlay">
                <div className="contest-alert" > 
                    <p> Thời gian làm: 60p</p>
                    <button
                        onClick={handleInitialState}
                    >
                        Bắt Đầu 
                    </button>
                </div>
            </div>
            }
            <div ref={textRef} className="contest-layout" style={{ height: `${windowHeight - 150}px` }}>
                <div className="paragraph-content">
                    <h2>{contest.paragraphs[activeParagraph].title}</h2>
                    <p>
                        {contest.paragraphs[activeParagraph].content.split('\n\n').map((text: string, index: number) => (
                            <span key={index}>
                                {text}
                                <br /><br />
                            </span>
                        ))}
                    </p>
                </div>

                <div className="sections-content">
                    {contest.paragraphs[activeParagraph].sections.map((section: any, secIndex: number) => (
                        <div key={secIndex}>
                            <p className="mb-4 font-bold"> Section {secIndex + 1}: {section.type}</p> 
                            {section.type === 'Matching Heading' && renderMatchingTable(section)}
                            {section.type === 'Matching Paragraph Information' && renderMatchingTable(section)}
                            {section.type === 'Matching Features' && renderMatchingTable(section)}
                            {section.type === 'Matching Sentence Endings' && renderMatchingTable(section)}
                            {section.questions.map((question: any, qIndex: number) => (
                                <div
                                 key={qIndex}
                                 className="mb-2">
                                    <b className="mr-2">{++cnt}</b>
                                    <span>
                                        {section.type === 'True/False/Not Given' && renderTrueFalseNotGiven(secIndex, qIndex)}
                                        {section.type === 'Yes/No/Not Given' && renderYesNoNotGiven(secIndex, qIndex)}
                                        <span className="ml-2"> {section.type.includes('Fill in the blank') && replaceDotsWithTextarea(secIndex, qIndex, question.question)} </span> 
                                        <span className="ml-2"> {!section.type.includes('Fill in the blank') && (question.question)} </span> 
                                    </span>
                                    {section.type === 'Matching Heading' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Matching Paragraph Information' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Matching Features' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Matching Sentence Endings' && renderMatchingType(secIndex, qIndex, section)}
                                    {section.type === 'Multiple Choice One Answer' && renderMultipleChoiceOneAnswer(secIndex, qIndex, section)}
                                    {section.type === 'Multiple Choice Multiple Answer' && renderMultipleChoiceMultipleAnswer(secIndex, qIndex, section)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {isHighlighting && highlightPosition && (
                <div className=''
                style={{
                    position: 'absolute',
                    top: highlightPosition.top + highlightPosition.height + 10,
                    left: highlightPosition.left,
                    backgroundColor: 'black',
                    padding: '5px',
                    borderRadius: '4px',
                }}
                >
                <button
                    onClick={() => applyHighlight('yellow')}
                    style={{ border: `2px solid ${buttonStyles['yellow'].borderColor}`, marginRight: '5px', marginLeft:'0px', backgroundColor:'yellow', width:'50px',height:'50px'}}
                >
                </button>
                <button
                    onClick={() => applyHighlight('lightgreen')}
                    style={{ border: `2px solid ${buttonStyles['lightgreen'].borderColor}`, marginRight: '5px', marginLeft:'0px', backgroundColor:'lightgreen', width:'50px',height:'50px' }}
                >
                </button>
                <button
                    onClick={() => applyHighlight('lightblue')}
                    style={{ border: `2px solid ${buttonStyles['lightblue'].borderColor}`, marginRight: '5px', marginLeft:'0px', backgroundColor:'lightblue', width:'50px',height:'50px'  }}
                >
                </button>
                <button
                    onClick={() => applyHighlight('white')}
                    style={{ border: `2px solid ${buttonStyles['white'].borderColor}`, marginLeft:'0px', backgroundColor:'white', width:'50px',height:'50px'  }}
                >
                </button>
                </div>
            )}
        </div>
        {!initialState && <header className="sticky bottom-0 bg-gray-200 dark:bg-gray-400 bg-opacity-90 text-white backdrop-blur-sm shadow-sm z-50">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-5"> 
                    <div>
                        <span className="text-black"> Paragraph: </span> 
                        {contest.paragraphs.map((paragraph: any, index: number) => (
                            <button 
                            className={`rounded-full p-2 ml-2 ${activeParagraph === index ? 'bg-[#3d5a80]' : 'bg-[#0077B6]'}`}
                            key={index}
                             onClick={() => handleParagraphSwitch(index)}>
                                {index + 1}
                            </button>
                        ))}
                    </div>   
                    <div>
                        <span className="text-black mr-4 font-black">Time: {formatTime(timeLeft)} </span>
                        <button className="bg-[#0077B6] rounded p-2" onClick={handleSubmit}>Submit Answers</button>
                    </div>
                </div>
            </div>
        </header>
        }
        </>
    );
};

export default ReadingContest;
