'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import config from '../config';
import { useSearchParams } from "next/navigation";

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
    const [authorId, setAuthorId] = useState('');
    const [curlike, setCurlike] = useState(0);
    const [curdislike, setCurdislike] = useState(0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [view, setView] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [rootComments, setRootComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [time_created, setTime_created] = useState('');
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingDislike, setLoadingDislike] = useState(false);
    const [isCommentVisible, setIsCommentVisible] = useState(false);

    const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set());
    const toggleCommentVisibility = (commentId: number) => {
        setVisibleComments(prev => {
            const newVisibleComments = new Set(prev);
            if (newVisibleComments.has(commentId)) {
                newVisibleComments.delete(commentId);
            } else {
                newVisibleComments.add(commentId);
            }
            return newVisibleComments;
        });
    };

    // New states for replies
    const [newReply, setNewReply] = useState<{[key: number]: string}>({});
    const [replyVisible, setReplyVisible] = useState<{[key: number]: boolean}>({});

    const handleLineClick = () => {
        setIsCommentVisible(!isCommentVisible);
    };

    const handleReplyClick = (commentId: number) => {
        setReplyVisible({ ...replyVisible, [commentId]: !replyVisible[commentId] });
    };

    const handleReplyChange = (commentId: number, content: string) => {
        setNewReply({ ...newReply, [commentId]: content });
    };

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            get_blog();
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
            const sortedComments = (result.comments || []).sort((a: Comment, b: Comment) => 
                new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
            );

            setTitle(result.title);
            setContent(result.content);
            setAuthor(result.author);
            setAuthorId(result.authorId);
            setCurlike(result.like || 0);
            setCurdislike(result.dislike || 0);
            setView(result.view);
            setTime_created(result.time_created);
            setComments(sortedComments);
            setRootComments(sortedComments.filter((comment: Comment) => comment.parent === -1));

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
            setIsCommentVisible(!isCommentVisible);
            setNewComment('');
            get_blog();
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Internal server error');
        }
    }

    const handleReply = async (parent: number) => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            const replyContent = newReply[parent];
            await axios.post(`${config.API_BASE_URL}api/add_reply`, { blog_id, parent, content: replyContent }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            // Clear the reply input and refresh the comments
            setNewReply({...newReply, [parent]: ''});
            setReplyVisible({...replyVisible, [parent]: false});
            get_blog();
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Internal server error');
        }
    };

    const renderComments = (commentIds: number[], depth = 0) => {
        return commentIds.map((commentId) => {
            const comment = comments.find(c => c.comment_id === commentId);
            if (!comment) return null;

            const isVisible = visibleComments.has(commentId);
            const toggleSymbol = isVisible ? '-' : '+';
            let ml_value = 5;

            if(depth === 0 || depth > 5) {
                ml_value = 0;
            }

            return (
                <li key={comment.comment_id} className={`border p-2 mb-2 ml-${ml_value}`}>
                    <div className="flex items-center">
                        {comment.children && comment.children.length > 0 && (
                            <button
                                onClick={() => toggleCommentVisibility(comment.comment_id)}
                                className="text-blue-600 hover:underline mr-2"
                            >
                                {toggleSymbol}
                            </button>
                        )}
                        <p><strong>{comment.username}</strong> <span className="text-gray-500">({new Date(comment.time_created).toLocaleString()})</span></p>
                    </div>
                    <p>{comment.content}</p>
                    <button
                        onClick={() => handleReplyClick(comment.comment_id)}
                        className="text-blue-600 hover:underline"
                    >
                        {replyVisible[comment.comment_id] ? 'Cancel' : 'Reply'}
                    </button>
                    {replyVisible[comment.comment_id] && (
                        <div>
                            <textarea
                                value={newReply[comment.comment_id] || ''}
                                onChange={(e) => handleReplyChange(comment.comment_id, e.target.value)}
                                rows={2}
                                cols={50}
                                placeholder="Write your reply here..."
                                className="border border-black rounded-md p-2 mb-2 w-full"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleReply(comment.comment_id)}
                                    className="bg-[#6baed6] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                    {isVisible && comment.children && comment.children.length > 0 && (
                        <ul>
                            {renderComments(comment.children, depth + 1)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    return (
        <div className="flex-grow flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-6xl">
                <p className="text-[#0077B6] text-3xl text-bold mb-2">{title}</p>
                <p className="mb-4">
                    <strong>By: </strong>
                    <Link href={`/profile/${authorId}`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">{author}</span>
                    </Link>
                    , {new Date(time_created).toLocaleString()}
                </p>
                <p className="border-l-4 border-gray-500 p-2 mb-4">{content}</p>
                <div className="bg-white border border-black rounded-md mb-2">
                    <div className="flex items-center justify-between mb-2 mt-2">
                        <div className="flex items-center">
                            <button 
                                onClick={handleLike}
                                className={`${
                                    liked ? 'bg-[#0077B6]' : 'bg-[#6baed6]'
                                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4 mr-2`}>
                                Like {curlike}
                            </button>
                            <button 
                                onClick={handleDislike}
                                className={`${
                                    disliked ? 'bg-[#0077B6]' : 'bg-[#6baed6]'
                                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 mr-4`}>
                                Dislike {curdislike}
                            </button>
                        </div>
                        <span className="mr-2">{view} &#128100;</span>
                    </div>
                </div>
                {!isCommentVisible && (
                    <p 
                        className="flex justify-end text-blue-700 underline decoration-blue-700" 
                        onClick={handleLineClick}
                    > 
                        Write comment?
                    </p>
                )}
                {isCommentVisible && (
                    <div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={4}
                            cols={50}
                            placeholder="Write your comment here..."
                            className="border border-black rounded-md p-2 mb-2 w-full"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handle_comment}
                                className="bg-[#6baed6] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Post
                            </button>
                            <button
                                onClick={handleLineClick}
                                className="bg-[#6baed6] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                <div>
                    <h3>Comments:</h3>
                    {comments.length > 0 ? (
                        <ul>
                            {renderComments(rootComments.map(comment => comment.comment_id))}
                        </ul>
                    ) : (
                        <p>No comments yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blogdetail;
