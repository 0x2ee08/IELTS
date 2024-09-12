'use client';
import React, { useState, useCallback, useRef, useEffect, use } from 'react';
import YouTube from 'react-youtube';
import "./styles.css";
import config from '../../config';
import axios from 'axios';
import { useSearchParams } from "next/navigation";
import { convertDuration } from './convertDuration';
import { formatDistanceToNow, parseISO } from 'date-fns';
import eyeIcon from './eye_icon.png';
import heartIcon from './heart_icon.png';
import Draggable from 'react-draggable';
const convertSecondsToReadable = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let formattedTime = '';
  if (hours > 0) formattedTime += `${hours}h`;
  if (minutes > 0) formattedTime += `${minutes}m`;
  formattedTime += `${secs}s`;

  return formattedTime;
};

const decodeHtmlEntities = (text: string): string => {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'"
    };
  
    return text.replace(/&[#A-Za-z0-9]+;/g, (entity) => entities[entity] || entity);
  };
  
const TedVideoDetail: React.FC = () => {
    const params = useSearchParams();
    const [notes, setNotes] = useState<string>('');
    const [message, setMessage] = useState<string>('')
    const [savedNotes, setSavedNotes] = useState<string>('')
    const [messages, setMessages] = useState<{ user: boolean, text: string }[]>([
        { user: false, text: 'Hello. How can I help you?' },
    ]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const parentContainer = messagesEndRef.current?.parentElement;
        if (parentContainer) {
            parentContainer.scrollTop = parentContainer.scrollHeight;
        }
    }, [messages]);

    const videoId = params.get("id") || '';
    const [video, setVideo] = useState({
        title: "",
        thumbnail: "",
        publishDate: "",
        channelId: "",
        duration: "",
        views: "",
        likes: "",
    });
    const [dateString, setDateString] = useState('');
    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [transcript, setTranscript] = useState<any[]>([]);
    const [isTranscriptVisible, setIsTranscriptVisible] = useState<boolean>(true);
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [sendingChat, setSendingChat] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 100, left: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isNoteVisible, setNoteVisible] = useState<boolean>(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.left, y: e.clientY - position.top });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const newLeft = e.clientX - dragStart.x;
        const newTop = e.clientY - dragStart.y;
        setPosition({ top: newTop, left: newLeft });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleNoteVisible =() => {
        setNoteVisible(!isNoteVisible);
    };

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, position]);

    const getVideo = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_ted_video_by_id`, { videoId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setVideo(response.data.video || []);
            const date = parseISO(response.data.video.publishDate.toString());
            setDateString(formatDistanceToNow(date, { addSuffix: true }));


        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const fetch_transcript = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post(`${config.API_BASE_URL}api/get_transcript`, { videoId }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = response.data;
        const decodedTranscript = result.transcript.map((item: any) => ({
            ...item,
            text: decodeHtmlEntities(item.text),
        }));
        setTranscript(decodedTranscript);

      } catch (error) {
        console.error('Error fetching transcript:', error);
        alert('Internal server error');
      }
    };

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            getVideo();
            fetch_transcript();
            handleGetNote(videoId);
            hasInitialize.current = true;
        }
    }, []);

    useEffect(() => {
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
      }, [currentTime, transcript]);

    const onReady = useCallback((event: { target: YT.Player }) => {
      setPlayer(event.target);
    }, []);
  
    const onStateChange = useCallback((event: { data: number }) => {
      if (event.data === YT.PlayerState.PLAYING) {
        const interval = setInterval(() => {
          if (player) {
            setCurrentTime(player.getCurrentTime());
          }
        }, 1000);
  
        return () => clearInterval(interval);
      }
    }, [player]);

    const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        const token = localStorage.getItem('token');
        const content = e.target.value;
        
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/save_note`, { videoId, content }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (response.status === 200 && response.data.success) {
                // alert('Note saved!');
            } else {
                // alert('Failed to save note');
            }
        } catch (error) {
            // setMessage('Failed to save note due to a network error.');
        }
    };
    
    const handleGetNote = async (video_id: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_note`, { video_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data;
            setNotes(result.content);
        } catch (error) {
            console.error('An error occurred while fetching the note:', error);
            setMessage('An error occurred while fetching the note');
            setSavedNotes('');
        }
    };

    const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setSendingChat(true);
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement;
        const token = localStorage.getItem('token');

        const newMessage = { role: 'user', content: input.value.trim() + " (Limit your response to 50 words.)"};
        const formattedMessages = [
            ...messages.map(msg => ({
                role: msg.user ? 'user' : 'assistant',
                content: msg.text
            })),
            newMessage
        ];

        axios.post(`${config.API_BASE_URL}api/send_chat`, 
            { message: formattedMessages },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            setMessages([...messages, 
                { user: true, text: input.value.trim() }, 
                { user: false, text: response.data.message }
            ]);
            input.value = '';
        })
        .catch(error => alert('Send Chat Error'))
        .finally(() => {
            setSendingChat(false);
        });
    };

    const opts = {
        height: '426px',
        width: '100%',
      playerVars: {
        autoplay: 1,
      },
    };
  
    const filteredTranscript = transcript.filter(item => currentTime >= item.offset);

    const toggleTranscriptVisibility = () => {
        setIsTranscriptVisible(!isTranscriptVisible);
      };

      return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-8 px-8 lg:px-12 py-8">
                {/* Left Column: 2/3 Width */}
                    <div className="lg:w-2/3 space-y-8">
                    {/* Left Column */}
                    <div style={{ display: 'grid', gridGap: '10px', height:'auto' }}>
                        {/* Video Player */}
                        <YouTube
                            videoId={videoId}
                            opts={opts}
                            onReady={onReady}
                            onStateChange={onStateChange}
                            style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'

                            }}
                        />
                        <strong style={{fontSize: '20px'}}> {video.title}</strong>

                        {/* Video Description */}
                        <div style={{ padding: '10px', backgroundColor: '#ffff', borderRadius: '10px', boxShadow: '4px 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span style={{ color: '#888' }}>Thời lượng: {convertDuration(video.duration)} | {dateString}</span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#009bdb' }}>
                                        <img src={eyeIcon.src} alt="Views" style={{ width: '20px', height: '20px', marginRight: '5px' }} /> {video.views}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#009bdb' }}>
                                        <img src={heartIcon.src} alt="Likes" style={{ width: '20px', height: '20px', marginRight: '5px' }} /> {video.likes}
                                    </span>
                                    <span> 
                                        {!isNoteVisible && 
                                        <div className="flex justify-start"> 
                                            <button
                                            style={{
                                                color: '#0077b6'
                                            }}
                                            onClick = {handleNoteVisible}> 
                                                Note
                                            </button>
                                        </div> 
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Personal Notes */}
                        {isNoteVisible && 
                        <div
                            className="window"
                            ref={windowRef}
                            style={{ top: position.top, left: position.left }}
                            >
                            <div
                                className="toolbar"
                                onMouseDown={handleMouseDown}
                                style={{ borderBottom: '1px solid #d9d9d9'}}
                            >
                                    <button style ={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#0077b6',
                                        border: 'none',
                                        borderRadius: '12px',
                                        marginRight: '4px'
                                    }}
                                    onClick = {handleNoteVisible}> 
                                    </button>
                                <span> New Note </span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={handleNoteChange}
                                style={{
                                    border: 'none',
                                    padding: '10px',
                                    width: '100%',
                                    height: 'calc(100% - 40px)',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'transparent',
                                }}
                            ></textarea>
                        </div>
                        }
                    </div>
                </div>
                {/* Right Column: 1/3 Width */}
                <div className="lg:w-1/3 space-y-8">
                    {/* Right Column */}
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 0.675fr', gridGap: '20px' }}>
                        {/* Transcript */}
                        <div style={{
                            height: '426px',
                            width: '100%',
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #d9d9d9',
                        }}>
                            <h1 style={{
                                fontWeight: 'bold',
                                textAlign: 'center' as const,
                                color: '#0077b6',
                                fontSize: '24px',
                                margin: '0',
                            }}>TRANSCRIPT</h1>
                            <button onClick={toggleTranscriptVisibility} className="toggle-button text-blue-500">
                                {isTranscriptVisible ? "Hide Transcript" : "Show Transcript"}
                            </button>
                            <div className="border-b border-blue-500 mt-2"></div>
                            <div 
                                ref={transcriptRef}
                                style={{
                                color: '#555',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                maxHeight: '326px',
                                overflowY: 'auto',
                                }}
                            >
                            {filteredTranscript.map((item, index) => (
                                <div key={index}>
                                    {isTranscriptVisible ? (
                                        <p>
                                            <strong>
                                                {convertSecondsToReadable(Math.floor(item.offset))}:{' '} 
                                            </strong> 
                                            {decodeHtmlEntities(item.text)} 
                                        </p>
                                    ) : (
                                        <p style={{ margin: 0 }}>
                                            <strong>
                                                {convertSecondsToReadable(Math.floor(item.offset))}:{' '}  
                                            </strong> 
                                                {'.'.repeat(item.text.length)}
                                        </p>
                                    )}
                                    
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Chat Bot */}
                        <div style={{ padding: '1px', backgroundColor: '#0077B6', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', width:'100%', height:'320px'}}>
                            <h3 style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF' }}>AI chat bot</h3>
                            <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', width:'100%', height: '300px', overflow: 'hidden' }}>
                                <div style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '10px', paddingRight: '10px', wordWrap: 'break-word' }}>
                                    {messages.map((message, index) => (
                                        <div key={index} style={{ textAlign: message.user ? 'right' : 'left', marginBottom: '10px' }}>
                                            <div
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    background: message.user ? '#E5E5E5' : '#00B4D8',
                                                    maxWidth: '100%',
                                                    maxHeight:'100%',
                                                    wordWrap: 'break-word',
                                                    color: message.user ? '#000000' : '#FFFFFF',
                                                }}
                                            >
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={handleChatSubmit} style={{ display: 'flex' }}>
                                    <input type="text" name="chatInput" placeholder="Type a message..." style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }} />
                                    <button type="submit" style={{ padding: '8px 16px', marginLeft: '10px', borderRadius: '10px', backgroundColor: '#009bdb', color: '#fff', border: 'none', 
                                        cursor: sendingChat ? 'not-allowed' : 'pointer'}}
                                        disabled={sendingChat}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TedVideoDetail;