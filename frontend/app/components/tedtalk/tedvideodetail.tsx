'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import "./styles.css";
import config from '../../config';
import axios from 'axios';
import { useSearchParams } from "next/navigation";
import { convertDuration } from '../../../../backend/utils/convertDuration';
import { formatDistanceToNow, parseISO } from 'date-fns';

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
    const [messages, setMessages] = useState<{ user: boolean, text: string }[]>([
        { user: false, text: 'Hello. How can I help you?' },
        { user: true, text: 'Good morning.' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
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
    const transcriptRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        getVideo();
        fetch_transcript();
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

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    };

    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement;
        if (input.value.trim() !== '') {
            setMessages([...messages, { user: true, text: input.value.trim() }, { user: false, text: 'Hello. How can I help you?' }]);
            input.value = '';
        }
    };

    const opts = {
      height: '676',
      width: '1202',
      playerVars: {
        autoplay: 1,
      },
    };
  
    const filteredTranscript = transcript.filter(item => currentTime >= item.offset);

    return (
        <div className="flex flex-col min-h-screen">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridGap: '20px', padding: '20px', boxSizing: 'border-box' }}>
                {/* Left Column */}
                <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gridGap: '20px' }}>
                    {/* Video Player */}
                    <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                      <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={onReady}
                        onStateChange={onStateChange}
                      />
                    </div>

                    {/* Video Description */}
                    <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                        <strong>{video.title}</strong>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ color: '#888' }}>Thời lượng: {convertDuration(video.duration)} | {dateString}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', color: '#009bdb' }}>
                                    <img src="/path_to_eye_icon.png" alt="Views" style={{ marginRight: '5px' }} /> {video.views}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', color: '#009bdb' }}>
                                    <img src="/path_to_heart_icon.png" alt="Likes" style={{ marginRight: '5px' }} /> {video.likes}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Personal Notes */}
                    <div style={{padding: '10px', position: 'relative', borderRadius: '10px',boxShadow: '0 0px 0px rgba(0, 0, 0, 0.1)'}}>
                        <div style={{
                            backgroundImage: 'url(https://s3-alpha-sig.figma.com/img/6fcf/2061/ae4b0cd5da8149b7f430a7ad4198c1b0?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KlSDz23WBPGx-swvJTt6vSePBWBqPKZNh1XqvY61GynewD02VQ~~cNFXSmWsZmJH9Qq3P97PObKGr4louRFZPxUl2v4M~5TSgXrluDvZXaXYBzG3NiEi9MFNDlJteRirsvjTMufBgPLxfYmLUJJ4aGPQ-woEdOxNNYQdJSpftDB-Y4WFAZWyDqofTeFqXd-puaomrTMV-5bENz4yXrCWfe2HslcPuXmZXxHClt5weuijeFSsppeS6Mmaiq2GOun8JIoNQcxmYI~~y15DbRXBYnMlA45fhIBmmoH4woNUt5O7mTxmqrU9Jmhqu2C~~mBOBQElahpP38RYxJqDH2mctA__)',
                            backgroundSize: 'contain',
                            borderRadius: '10px',
                            opacity: 0.2,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1
                        }}></div>
                        <div style={{
                            position: 'relative',
                            zIndex: 2
                        }}>
                            <h3 style={{
                                fontSize: '25px',
                                fontWeight: 'bold',
                                color: '#00B4D8'
                            }}>Personal note:</h3>
                            <textarea
                                value={notes}
                                onChange={handleNoteChange}
                                style={{
                                    width: '100%',
                                    height: '110px',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'transparent',
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    color: '#333',
                                    resize: 'none',
                                }}
                                placeholder="Write your notes here..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'grid', gridTemplateRows: '0fr 0fr', gridGap: '0px' }}>
                    {/* Transcript */}
                    <div style={{
                        width: '600px',
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
                        <div className="border-b border-blue-500 mt-2"></div>
                        <div 
                            ref={transcriptRef}
                            style={{
                              color: '#555',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              maxHeight: '400px',
                              overflowY: 'auto',
                            }}
                        >
                          {filteredTranscript.map((item, index) => (
                            <div key={index}>
                              <p><strong>{convertSecondsToReadable(Math.floor(item.offset))}: </strong> {decodeHtmlEntities(item.text)}</p>
                            </div>
                          ))}
                        </div>
                    </div>
                    <br></br>
                    {/* Chat Bot */}
                    <div style={{ padding: '10px', backgroundColor: '#0077B6', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#FFFFFF' }}>AI chat bot BETA</h3>
                        <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '10px', paddingRight: '10px', maxHeight: '100px', }}>
                                {messages.map((message, index) => (
                                    <div key={index} style={{ textAlign: message.user ? 'right' : 'left', marginBottom: '10px' }}>
                                        <div
                                            style={{
                                                display: 'inline-block',
                                                padding: '8px',
                                                borderRadius: '10px',
                                                background: message.user ? '#E5E5E5' : '#00B4D8',
                                                maxWidth: '70%',
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
                                <button type="submit" style={{ padding: '8px 16px', marginLeft: '10px', borderRadius: '10px', backgroundColor: '#009bdb', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TedVideoDetail;
