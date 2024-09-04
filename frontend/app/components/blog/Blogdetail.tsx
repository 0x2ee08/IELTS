'use client';

import React, { useEffect, useState, useRef, useReducer } from 'react';
import axios from 'axios';
import Link from 'next/link';
import config from '../../config';
import { useSearchParams } from "next/navigation";
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css'; // Import CSS for the editor
import ReactMarkdown from 'react-markdown'

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
    const [newReply, setNewReply] = useState<{ [key: number]: string }>({});
    const [replyVisible, setReplyVisible] = useState<{ [key: number]: boolean }>({});

    const handleLineClick = () => {
        setIsCommentVisible(!isCommentVisible);
    };

    const handleReplyClick = (commentId: number) => {
        setReplyVisible({ ...replyVisible, [commentId]: !replyVisible[commentId] });
    };

    const handleReplyChange = (commentId: number, content: string) => {
        setNewReply({ ...newReply, [commentId]: content });
    };

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
            const sortedComments = (result.comments || []).sort((a: Comment, b: Comment) =>
                new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
            );
                // day la mang lag thoi
            setTitle(result.title);
            setContent(result.content);
            setAuthor(result.author);
            setUpvote(result.like || 0);
            setDownvote(result.dislike || 0);
            setView(result.view);
            setTime_created(result.time_created);
            setComments(result.comments);
            setRootComments(sortedComments.filter((comment: Comment) => comment.parent === -1));

            get_user_blog_list(Number(result.view));

        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Internal server error');
        }
    };

    const get_user_blog_list = async (view: number) => {
        get_blog();
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
            if (op) {
                update_blog(upvote, downvote, view + 1);
                setView(view + 1);
            }

        } catch (error) {
            console.error('Error get user emotion:', error);
            alert('Internal server error while updating like/dislike');
        }
    }

    const update_blog = async (like: number, dislike: number, view: number) => {
        get_blog();
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
        get_blog();
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
                await update_blog(upvote + 1, downvote, view);
                await update_user_emotion('like');
                setLiked(true);
                if (disliked) {
                    setDownvote(downvote - 1);
                    await update_blog(upvote + 1, downvote - 1, view);
                    setDisliked(false);
                }
                setUpvote(upvote + 1);
            } else {
                await update_blog(upvote - 1, downvote, view);
                await update_user_emotion('like');
                setUpvote(upvote - 1);
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
                await update_blog(upvote, downvote + 1, view);
                await update_user_emotion('dislike');
                setDisliked(true);
                if (liked) {
                    setUpvote(upvote - 1);
                    await update_blog(upvote - 1, downvote + 1, view);
                    setLiked(false);
                }
                setDownvote(downvote + 1);
            } else {
                await update_blog(upvote, downvote - 1, view);
                await update_user_emotion('dislike');
                setDownvote(downvote - 1);
                setDisliked(false);
            }
        } finally {
            setLoadingDislike(false);
        }
    };

    const calculateContribution = () => {
        return upvote - downvote;
    };

    const handle_comment = async () => {
        get_blog();
        if (!newComment || newComment.trim().length === 0) {
            alert('Comment cannot be empty' );
            return;
        }

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
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
                alert('Error while commenting: ' + errorMessage);
            } else {
                console.error('Error adding comment:', error);
                alert('Error while commenting: An unexpected error occurred');
            }
        }
    }

    const handleReply = async (parent: number) => {
        get_blog();
        if (!newReply[parent] || newReply[parent].trim().length === 0) {
            alert('Comment cannot be empty' );
            return;
        }

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
            setNewReply({ ...newReply, [parent]: '' });
            setReplyVisible({ ...replyVisible, [parent]: false });
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
    
            const isVisible = !visibleComments.has(commentId);
            const toggleSymbol = isVisible ? '-' : '+';
    
            // Determine margin based on depth
            const marginClass = depth > 5 ? '' : 'ml-4' ;
    
            return (
                <li key={comment.comment_id} className={`mb-2 ${marginClass}`}>
                    <div className="p-2 border border-gray-400 bg-slate-100 rounded">
                        <div>
                            <div className="flex items-center">
                                {comment.children && comment.children.length > 0 && (
                                    <button
                                        onClick={() => toggleCommentVisibility(comment.comment_id)}
                                        className="text-blue-600 hover:underline mr-2"
                                    >
                                        {toggleSymbol}
                                    </button>
                                )}
                                <p>
                                    <strong>{comment.username}</strong>
                                    <span className="text-gray-500">
                                        ({new Date(comment.time_created).toLocaleString()})
                                    </span>
                                </p>
                            </div>
                            <p> 
                                <ReactMarkdown>{comment.content}</ReactMarkdown>
                            </p>
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
                        </div>
                    </div>
                    {isVisible && comment.children && comment.children.length > 0 && (
                        <ul className="pl-6" style={{ marginTop: '10px', marginBottom: '10px' }}> 
                            {renderComments(comment.children, depth + 1)}
                        </ul>
                    )}
                </li>
            );
        });
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
                {!isCommentVisible && (
                    <p
                        className="flex justify-end text-blue-700 underline decoration-blue-700 cursor-pointer"
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
                    <h3 className="mb-10">Comments :</h3>
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
