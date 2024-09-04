'use client';

import React, { useEffect, useState, useRef, useReducer } from 'react';
import axios from 'axios';
import Link from 'next/link';
import config from '../../config';
import { useSearchParams } from "next/navigation";
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown'
import CommentsPage from './Comments';

// Import markdown parser
import markdownIt from 'markdown-it';

const mdParser = new markdownIt();

function underlinePlugin(md: markdownIt) {
    md.inline.ruler.before('emphasis', 'underline', function (state, silent) {
      const start = state.pos;
      const marker = state.src.charCodeAt(start);
  
      // Check for the ++ marker
      if (silent || marker !== 0x2B /* + */ || state.src.charCodeAt(start + 1) !== 0x2B /* + */) {
        return false;
      }
  
      const match = state.src.slice(start).match(/^\+\+([^+]+)\+\+/);
      if (!match) return false;
  
      // Push the underline open token
      const token = state.push('underline_open', 'u', 1);
      token.markup = '++';
      token.content = match[1];
  
      // Push the content inside the underline
      const tokenText = state.push('text', '', 0);
      tokenText.content = match[1];
  
      // Push the underline close token
      state.push('underline_close', 'u', -1);
  
      // Move the state position forward
      state.pos += match[0].length;
      return true;
    });
  
    md.renderer.rules.underline_open = () => '<u>';
    md.renderer.rules.underline_close = () => '</u>';
  }

mdParser.use(underlinePlugin);

interface Comment {
    username: string;
    time_created: string;
    children: number[]; // Changed from Comment[] to number[]
    parent: number;
    comment_id: number;
    content: string;
    replies?: Comment[];
}

const Blogdetail: React.FC = () => {
    const params = useSearchParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [upvote, setUpvote] = useState(0);
    const [downvote, setDownvote] = useState(0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [view, setView] = useState(0);
    const [time_created, setTime_created] = useState('');
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingDislike, setLoadingDislike] = useState(false);

    // New states for replies
    const [newReply, setNewReply] = useState<{ [key: number]: string }>({});
    const [replyVisible, setReplyVisible] = useState<{ [key: number]: boolean }>({});

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            get_blog();
            hasInitialize.current = true;
        }
    }, []);


    const get_blog = async () => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            const response = await axios.post(`${config.API_BASE_URL}api/get_blog`, { blog_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data.result;

            setTitle(result.title);
            setContent(result.content);
            setAuthor(result.author);
            setUpvote(result.like || 0);
            setDownvote(result.dislike || 0);
            setView(result.view || 0);
            setTime_created(result.time_created);

            get_user_blog_list(Number(result.view));

        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Internal server error');
        }
    };

    const get_blog_like_dislike_view = async () => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            const response = await axios.post(`${config.API_BASE_URL}api/get_blog_like_dislike_view`, { blog_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data;

            setUpvote(result.like || 0);
            setDownvote(result.dislike || 0);
            setView(result.view || 0);

        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Internal server error 1');
        }
    };

    const get_user_blog_list = async (view: number) => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            const response = await axios.post(`${config.API_BASE_URL}api/get_user_blog_list`, { blog_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const { liked, disliked, op } = response.data;
            setLiked(liked);
            setDisliked(disliked);
            if (op) update_blog(0, 0, 1);

        } catch (error) {
            console.error('Error get user emotion:', error);
            alert('Internal server error while updating like/dislike');
        }
    }

    const update_blog = async (like: number, dislike: number, view: number) => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            await axios.post(`${config.API_BASE_URL}api/update_blog_like_dislike_view`, { blog_id, like, dislike, view }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

        } catch (error) {
            console.error('Error updating blog:', error);
            alert('Internal server error');
        }
        get_blog_like_dislike_view();
    };

    const update_user_emotion = async (action: string) => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            await axios.post(`${config.API_BASE_URL}api/update_user_emotion`, { blog_id, action }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error updating emotion:', error);
            alert('Internal server error');
        }
    };

    const handleUpvote = async () => {
        if (loadingLike || loadingDislike) return;
        setLoadingLike(true);
        try {
            if (!liked) {
                await update_blog(1, 0, 0);
                await update_user_emotion('like');
                setLiked(true);
                if (disliked) {
                    await update_blog(0, -1, 0);
                    setDisliked(false);
                }
            } else {
                await update_blog(-1, 0, 0);
                await update_user_emotion('like');
                setLiked(false);
            }
        } finally {
            setLoadingLike(false);
        }
    };

    const handleDownvote = async () => {
        if (loadingLike || loadingDislike) return;
        setLoadingDislike(true);
        try {
            if (!disliked) {
                await update_blog(0, 1, 0);
                await update_user_emotion('dislike');
                setDisliked(true);
                if (liked) {
                    await update_blog(-1, 0, 0);
                    setLiked(false);
                }
            } else {
                await update_blog(0, -1, 0);
                await update_user_emotion('dislike');
                setDisliked(false);
            }
        } finally {
            setLoadingDislike(false);
        }
    };

    const calculateContribution = () => {
        return upvote - downvote;
    };

    const test = mdParser.render(content);
    // console.log(test);
    useEffect(() => {
        console.log('Component rendered with content:', content);
        console.log(test);
      }, [content]);

    return (
        <div className="flex-grow flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-6xl">
                <p className="text-[#0077B6] text-3xl font-bold mb-2">{title}</p>
                <p className="mb-4">
                    <strong>By: </strong>
                    <Link href={`/profile`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">{author}</span>
                    </Link>
                    , {new Date(time_created).toLocaleString()}
                </p>
                <div className="border-l-4 border-gray-500 p-2 mb-4"> 
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                <div className="bg-white border border-black rounded-md mb-2 p-2 flex justify-between items-center">
                    <div className="flex flex-col items-start">
                        <span className="text-lg font-semibold mb-1">Contribution: {calculateContribution()}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleUpvote}
                                className={`${
                                    liked ? 'bg-[#0077B6]' : 'bg-[#6baed6]'
                                } hover:bg-blue-700 text-white font-bold text-sm py-1 px-2 rounded focus:outline-none focus:shadow-outline`}>
                                Upvote {upvote}
                            </button>
                            <button
                                onClick={handleDownvote}
                                className={`${
                                    disliked ? 'bg-[#0077B6]' : 'bg-[#6baed6]'
                                } hover:bg-blue-700 text-white font-bold text-sm py-1 px-2 rounded focus:outline-none focus:shadow-outline`}>
                                Downvote {downvote}
                            </button>
                        </div>
                    </div>
                    <span className="text-sm">{view} &#128100;</span>
                </div>
                
                <CommentsPage
                    blog_id = {params.get("id") || ''}
                />

            </div>
        </div>
    );
};

export default Blogdetail;
