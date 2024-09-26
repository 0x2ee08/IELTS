'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Reading.css';
import { time } from 'console';
import axios from 'axios';
import config from '../../config';
import { useRouter } from 'next/navigation';
import { Editor, DraftHandleValue, EditorState, ContentState, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

interface Paragraph {
    content: ContentState; // Store content state instead of plain text
    questions: ContentState[]; // Store content state for each question
  }

const ReadingContest = ({ contest }: { contest: any }) => {
    const [leftWidth, setLeftWidth] = useState(50); // Left section width in percentage
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const initialLeftWidth = leftWidth; // Initial width in percentage

    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newLeftWidth = (event.clientX / window.innerWidth) * 100; // Calculate new width in percentage

        // Restrict the new width between 20% and 80%
        if (newLeftWidth >= 20 && newLeftWidth <= 80) {
          setLeftWidth(newLeftWidth);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
        <select 
            value={userAnswers[activeParagraph]?.[sectionIndex]?.[questionIndex] || ''}
            onChange={(e) => handleAnswerChange(sectionIndex, questionIndex, e.target.value)}>
            {['','Yes', 'No', 'Not Given'].map((option: string, oIndex: number) => (
                <option key={oIndex} value={option}>{option}</option>
            ))}
        </select>
    );

    const renderMatchingTable = (section: any) => {
        return (
            <div className='flex justify-center items-center'>
                    <div className="matching-table"> 
                        <div className="flex flex-col">
                            <p className='text-center'>List of things</p>
                            {section.options.map((option: string, index: number) => (
                            <p> {integerToRoman(index+1)}. {option}</p>
                            ))}
                        </div>
                    </div>
            </div>
        );
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
    const createInitialParagraphs = (contest: any): Paragraph[] => {
        return contest.paragraphs.map((paragraph: any, index: number) => ({
          content: ContentState.createFromText(paragraph.content || ''),
          questions: [ContentState.createFromText(paragraph.section || '')],
        }));
      };
      
      const initialParagraphs = createInitialParagraphs(contest);
    

    const [paragraphs, setParagraphs] = useState<Paragraph[]>(initialParagraphs);
    const [editorState, setEditorState] = useState(() =>
        EditorState.createWithContent(paragraphs[0].content)
    );
    const [questionStates, setQuestionStates] = useState(() =>
        paragraphs[0].questions.map((q) => EditorState.createWithContent(q))
    );
    const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [currentEditor, setCurrentEditor] = useState<'paragraph' | 'question' | null>(null);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // Check if text is selected and update highlighting status and position
    const checkSelection = () => {
        const selection = window.getSelection();
        const textContent = textRef.current?.innerText.trim() || '';

        // If no text or selection, hide highlight options
        if (textContent === '' || !selection || selection.rangeCount === 0) {
        setIsHighlighting(false);
        setHighlightPosition(null);
        return;
        }

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
    };

    // Handle paragraph changes
    const handleParagraphChange = (index: number) => {
        // Save the current editor states before switching
        const updatedParagraphs = [...paragraphs];
        updatedParagraphs[activeParagraph].content = editorState.getCurrentContent();
        updatedParagraphs[activeParagraph].questions = questionStates.map((q) => q.getCurrentContent());
        setParagraphs(updatedParagraphs);

        // Load new paragraph and questions
        setActiveParagraph(index);
        setEditorState(EditorState.createWithContent(paragraphs[index].content));
        setQuestionStates(paragraphs[index].questions.map((q) => EditorState.createWithContent(q)));
        setIsHighlighting(false); // Reset highlighting state when switching
        setCurrentEditor(null); // Reset the active editor
    };

    // Apply inline style for highlighting with a specific color
    const applyHighlight = (color: string) => {
        if (currentEditor === 'paragraph') {
            const selection = editorState.getSelection();
            const contentState = editorState.getCurrentContent();
            const stylesToRemove = ['GREENLIGHT', 'BLUELIGHT', 'YELLOW', 'WHITE'];
            let newContentState = stylesToRemove.reduce((contentState, style) => {
                return Modifier.removeInlineStyle(contentState, selection, style);
            }, contentState);
            newContentState = Modifier.applyInlineStyle(newContentState, selection, color);
            const newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
            const updatedEditorState = EditorState.setInlineStyleOverride(newEditorState, newEditorState.getCurrentInlineStyle());
            setEditorState(updatedEditorState);
        } else if (currentEditor === 'question' && selectedQuestionIndex !== null) {
            const questionState = questionStates[selectedQuestionIndex];
            const selection = questionState.getSelection();
            const contentState = questionState.getCurrentContent();
            const stylesToRemove = ['GREENLIGHT', 'BLUELIGHT', 'YELLOW', 'WHITE'];
            let newContentState = stylesToRemove.reduce((contentState, style) => {
                return Modifier.removeInlineStyle(contentState, selection, style);
            }, contentState);
            newContentState = Modifier.applyInlineStyle(newContentState, selection, color);
            const newQuestionState = EditorState.push(questionState, newContentState, 'change-inline-style');
            const updatedQuestionState = EditorState.setInlineStyleOverride(newQuestionState, newQuestionState.getCurrentInlineStyle());
            const newQuestionStates = [...questionStates];
            newQuestionStates[selectedQuestionIndex] = updatedQuestionState;
            setQuestionStates(newQuestionStates);
        }
        setIsHighlighting(false);
    };

    // Define custom style mapping for highlight colors
    const styleMap = {
        GREENLIGHT: { backgroundColor: '#90EE90' },
        BLUELIGHT: { backgroundColor: '#ADD8E6' },
        YELLOW: { backgroundColor: '#FFFF00' },
        WHITE: { backgroundColor: '#FFFFFF' },
    };

    // Handle mouse and key events for checking selection in paragraphs and questions
    const handleEditorMouseUp = (editorType: 'paragraph' | 'question', index?: number) => {
        setCurrentEditor(editorType);
        if (editorType === 'question' && index !== undefined) {
        setSelectedQuestionIndex(index);
        }
        checkSelection();
    };

    const handleGoBack = async() => {
        window.location.href = '../contests'
    }

    const handleBeforeInput = (chars: string, editorState: EditorState): DraftHandleValue => {
        return 'handled';
    };
    
    const handleKeyCommand = (command: string, editorState: EditorState): DraftHandleValue => {
        if (command === 'delete' || command === 'backspace') {
          return 'handled';
        }
        return 'not-handled'; 
      };
    const handlePastedText = (text: string, html: string | undefined, editorState: EditorState): DraftHandleValue => {
    return 'handled';
    };
    const handleDrop = (selection: any, dataTransfer: any, isInternal: any): DraftHandleValue => {
        return 'handled';
    };
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
            e.preventDefault();
        }
    };
    useEffect(() => {
        const editorElement = textRef.current;
        if (editorElement) {
            editorElement.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            if (editorElement) {
                editorElement.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    let cnt=0;
    return (
        <>
        <div className="reading-contest-page">
            {initialState && <div className="overlay">
                <div className="contest-alert" > 
                        <span
                    onClick={handleGoBack}
                    style={{
                        cursor: 'pointer',
                        float: 'right',
                        fontSize: '24px',
                        marginTop: '-10px',
                        marginRight: '0px',
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                    }}
                    >
                        &times;
                    </span>
                    <h2
                    style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                    }}
                    >
                    Bắt đầu làm bài
                    </h2>
                    <p
                    style={{
                        fontSize: '16px',
                        marginBottom: '10px',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    }}
                    >
                        Bài test này gồm <span style={{ color: '#007bff', fontWeight: 'bold'}}>3 phần</span> và{' '}
                        <span style={{ color: '#007bff', fontWeight: 'bold' }}>36 câu hỏi</span>. Bạn có{' '}
                        <span style={{ color: '#007bff', fontWeight: 'bold' }}>60 phút</span> để hoàn thành.
                    </p>
                    <p
                    style={{
                        fontSize: '16px',
                        marginBottom: '20px',
                        fontWeight: 'normal',
                    }}
                    >
                        Nếu bạn đã sẵn sàng, hãy bấm vào nút Bắt đầu làm bài.
                    </p>
                    <button
                        onClick={handleInitialState}
                        style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '93%',
                        }}
                    >
                        Bắt đầu làm bài
                    </button>
                </div>
            </div>
            }
            <div ref={containerRef} className="contest-layout" style={{ height: `${windowHeight - 150}px` }}>
                <div className="paragraph-content" style={{ width: `${leftWidth}%` }}>
                    <h2>{contest.paragraphs[activeParagraph].title}</h2>
                    <div onCut={(e) => e.preventDefault()} 
                        onMouseUp={() => handleEditorMouseUp('paragraph')} 
                        ref={textRef}
                        onDrop={(e) => e.preventDefault()}>
                        <Editor editorState={editorState}
                                onChange={setEditorState}
                                customStyleMap={styleMap} 
                                handleBeforeInput={handleBeforeInput}
                                handleKeyCommand={handleKeyCommand}
                                handlePastedText={handlePastedText}
                                handleDrop={handleDrop}
                        />
                    </div>
                </div>
                <div className="splitter-bar" onMouseDown={handleMouseDown} />
                <div 
                    style={{ width: `${100 - leftWidth}%` }}
                    className="sections-content">
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
                <div
                style={{
                    position: 'absolute',
                    padding:'4px',
                    borderRadius:'5px',
                    top: highlightPosition.top + highlightPosition.height + 10,
                    left: highlightPosition.left,
                    backgroundColor:'rgba(0, 0, 0, 0.7)',
                    zIndex: 1000,
                }}
                >
                <button style={{ borderRadius:'3px', background:'#90EE90', 
                                marginRight: '5px', marginLeft:'3px', padding:'4px',
                                width:'20px',height:'20px'  }} onClick={() => applyHighlight('GREENLIGHT')}></button>
                <button style={{ borderRadius:'3px', background:'#ADD8E6', padding:'4px',
                                marginRight: '5px', marginLeft:'0px',
                                width:'20px',height:'20px'  }} onClick={() => applyHighlight('BLUELIGHT')}></button>
                <button style={{ borderRadius:'3px', background:'#FFFF00', padding:'4px',
                                marginRight: '5px', marginLeft:'0px',
                                width:'20px',height:'20px'  }} onClick={() => applyHighlight('YELLOW')}></button>
                <button style={{ borderRadius:'3px', background:'#FFFFFF', padding:'4px',
                                marginRight: '3px', marginLeft:'0px',
                                width:'20px',height:'20px'  }} onClick={() => applyHighlight('WHITE')}></button>
                </div>
            )}
        </div>
        {!initialState && <header className="sticky bottom-0 bg-gray-200 bg-opacity-90 text-white backdrop-blur-sm shadow-sm z-50">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-5"> 
                    <div>
                        <span className="text-black"> Paragraph: </span> 
                        {contest.paragraphs.map((paragraph: any, index: number) => (
                            <button 
                            className={`rounded-full p-2 ml-2 ${activeParagraph === index ? 'bg-[#3d5a80]' : 'bg-[#0077B6]'}`}
                            key={index}
                             onClick={() => handleParagraphChange(index)}>
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
