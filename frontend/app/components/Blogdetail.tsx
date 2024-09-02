'use client'

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import { useSearchParams } from "next/navigation";

interface Comment {
    username: string;
    time_created: string; // Use ISO string format for dates
    content: string;
}

const Blogdetail: React.FC = () => {
    const params = useSearchParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [curlike, setCurlike] = useState(0);
    const [curdislike, setCurdislike] = useState(0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [view, setView] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [time_created, setTime_created] = useState('');
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingDislike, setLoadingDislike] = useState(false);
    const [count, setCount] = useState(0);

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
            setCurlike(result.like || 0);
            setCurdislike(result.dislike || 0);
            setView(result.view);
            setTime_created(result.time_created);
            setComments(result.comments || []);

            get_user_blog_list(Number(result.view));

        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Internal server error');
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
            if(op) {
                update_blog(curlike, curdislike, view + 1);
                setView(view + 1);
            }

        } catch(error) {
            console.error('Error get user emotion:', error);
            alert('Internal server error while updating like/dislike');
        }
    }

    const update_blog = async (like: number, dislike: number, view: number) => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            await axios.post(`${config.API_BASE_URL}api/update_blog`, { blog_id, like, dislike, view }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

        } catch (error) {
            console.error('Error updating blog:', error);
            alert('Internal server error');
        }
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
    
    const handleLike = async () => {
        if (loadingLike || loadingDislike) return;
        setLoadingLike(true);
        try {
            if (!liked) {
                await update_blog(curlike + 1, curdislike, view);
                await update_user_emotion('like');
                setLiked(true);
                if (disliked) {
                    setCurdislike(curdislike - 1);
                    await update_blog(curlike + 1, curdislike - 1, view);
                    setDisliked(false);
                }
                setCurlike(curlike + 1);
            } else {
                await update_blog(curlike - 1, curdislike, view);
                await update_user_emotion('like');
                setCurlike(curlike - 1);
                setLiked(false);
            }
        } finally {
            setLoadingLike(false);
        }
    };
    
    const handleDislike = async () => {
        if (loadingLike || loadingDislike) return;
        setLoadingDislike(true);
        try {
            if (!disliked) {
                await update_blog(curlike, curdislike + 1, view);
                await update_user_emotion('dislike');
                setDisliked(true);
                if (liked) {
                    setCurlike(curlike - 1);
                    await update_blog(curlike - 1, curdislike + 1, view);
                    setLiked(false);
                }
                setCurdislike(curdislike + 1);
            } else {
                await update_blog(curlike, curdislike - 1, view);
                await update_user_emotion('dislike');
                setCurdislike(curdislike - 1);
                setDisliked(false);
            }
        } finally {
            setLoadingDislike(false);
        }
    };

    const handle_comment = async () => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            await axios.post(`${config.API_BASE_URL}api/add_comment`, { blog_id, content: newComment }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setNewComment('');
            get_blog();
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Internal server error');
        }
    }

    const hasInitialized = useRef(false);
    if (!hasInitialized.current) {
        hasInitialized.current = true;
        get_blog(); 
    }

    return (
        <div>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Author:</strong> {author}</p>
            <p><strong>Time Created</strong> {new Date(time_created).toLocaleString()}</p>
            <p><strong>View:</strong> {view}</p>
            <p><strong>Content:</strong> {content}</p>

            <button 
                onClick={handleLike}
                className={`${
                    liked ? 'bg-blue-800' : 'bg-blue-500'
                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4 mr-2`}>
                Like {curlike}
            </button>
            <button 
                onClick={handleDislike}
                className={`${
                    disliked ? 'bg-blue-800' : 'bg-blue-500'
                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 mr-4`}>
                Dislike {curdislike}
            </button>

            <div>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    cols={50}
                    placeholder="Write your comment here..."
                    className="border p-2 mb-2 w-full"
                />
                <button
                    onClick={handle_comment}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Submit Comment
                </button>
            </div>

            <div>
                <h3>Comments:</h3>
                {comments.length > 0 ? (
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index} className="border p-2 mb-2">
                                <p><strong>{comment.username}</strong> <span className="text-gray-500">({new Date(comment.time_created).toLocaleString()})</span></p>
                                <p>{comment.content}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>
        </div>
    );
};

export default Blogdetail;
