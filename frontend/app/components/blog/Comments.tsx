'use client';

import React, { useEffect, useState, useRef, useReducer } from 'react';
import axios from 'axios';
import Link from 'next/link';
import config from '../../config';
import { useSearchParams } from "next/navigation";
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw';
import markdownIt from 'markdown-it';
import style from './react-markdown-styles.module.css';
import MarkdownContent from './MarkdownContent';

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

interface CommentsPage {
    blog_id: string;
}

interface Comment {
    username: string;
    time_created: string;
    children: number[]; 
    parent: number;
    comment_id: number;
    content: string;
    replies?: Comment[];
}

const CommentsPage: React.FC<CommentsPage> = ({ blog_id }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [rootComments, setRootComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
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

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            get_comments_by_blog_id();
            hasInitialize.current = true;
        }
    }, []);

    const [newReply, setNewReply] = useState<{ [key: number]: string }>({});
    const [replyVisible, setReplyVisible] = useState<{ [key: number]: boolean }>({});
    const [avatarUrl, setAvatarUrl] = useState<Map<string, string>>(new Map());

    const get_comments_by_blog_id = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/get_comments_by_blog_id`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ blog_id }),
            });
            const result = await response.json();
            if (response.ok) {
                const sortedComments = (result.comments || []).sort((a: Comment, b: Comment) =>
                    new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
                );
                setComments(result.comments);
                setRootComments(sortedComments.filter((comment: Comment) => comment.parent === -1));
            } else {
                alert('Error Getting Comments: ' + result.error);
            }

        } finally {
        }
    };

    const get_avatar = async(username: string) => {
        if(avatarUrl.has(username)) return; 
        const token = localStorage.getItem('token');
        try {;
            const response = await axios.post(`${config.API_BASE_URL}api/get_avatar`, { username }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setAvatarUrl(prev => new Map(prev).set(username, response.data.avatar));
        } catch (error) {
        }
    }

    const handle_comment = async () => {
        if (!newComment || newComment.trim().length === 0) {
            alert('Comment cannot be empty' );
            return;
        }

        const token = localStorage.getItem('token');
        try {;
            await axios.post(`${config.API_BASE_URL}api/add_comment`, { blog_id, content: newComment }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setIsCommentVisible(!isCommentVisible);
            setNewComment('');
            get_comments_by_blog_id();
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
        get_comments_by_blog_id();
        if (!newReply[parent] || newReply[parent].trim().length === 0) {
            alert('Comment cannot be empty' );
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const replyContent = newReply[parent];
            await axios.post(`${config.API_BASE_URL}api/add_reply`, { blog_id, parent, content: replyContent }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            // Clear the reply input and refresh the comments
            setNewReply({ ...newReply, [parent]: '' });
            setReplyVisible({ ...replyVisible, [parent]: false });
            get_comments_by_blog_id();
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Internal server error');
        }
    };

    const handleLineClick = () => {
        setIsCommentVisible(!isCommentVisible);
    };

    const handleReplyClick = (commentId: number) => {
        setReplyVisible({ ...replyVisible, [commentId]: !replyVisible[commentId] });
    };

    const handleReplyChange = (commentId: number, content: string) => {
        setNewReply({ ...newReply, [commentId]: content });
    };


    const renderComments = (commentIds: number[], depth = 0) => {
        return commentIds.map((commentId) => {
            const comment = comments.find(c => c.comment_id === commentId);
            if (!comment) return null;
    
            const isVisible = !visibleComments.has(commentId);
            const toggleSymbol = isVisible ? '-' : '+';
    
            // Determine margin based on depth
            const marginClass = depth > 5 ? '' : 'ml-4' ;

            get_avatar(comment.username);
    
            return (
                <li key={comment.comment_id} className={`mb-2 ${marginClass}`}>
                    <div className="p-2 border border-gray-400 bg-[#fff] rounded">
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
                                <div>
                                    <img src={avatarUrl.get(comment.username) || '/default-avatar.png'} alt="Avatar" className="w-9 h-9 rounded-full" />
                                </div>
                                <p>
                                    <Link href={`/loader/profile?id=${comment.username}`}>
                                        <span className="text-blue-600 hover:underline cursor-pointer">&nbsp;{comment.username}</span>
                                    </Link>
                                    <span className="text-gray-500">
                                        ({new Date(comment.time_created).toLocaleString()})
                                    </span>
                                </p>
                            </div>
                            <p> 
                                <MarkdownContent content={comment.content} />
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

    return (
        <div>
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
    );
};

export default CommentsPage;
