import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useSearchParams } from "next/navigation";

const Blogdetail: React.FC = () => {
    const params = useSearchParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [curlike, setCurlike] = useState(0);
    const [curdislike, setCurdislike] = useState(0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

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
            setCurlike(Number(result.like));
            setCurdislike(Number(result.dislike));

        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Internal server error');
        }
    };

    const get_user_emotion = async () => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            const response = await axios.post(`${config.API_BASE_URL}api/get_user_emotion`, { blog_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const { liked, disliked } = response.data; 
            setLiked(liked);
            setDisliked(disliked);

        } catch(error) {
            console.error('Error get user emotion:', error);
            alert('Internal server error while updating lise/ dislike');
        }
    }

    const update_emotion = async (like: string, dislike: string) => {
        const token = localStorage.getItem('token');
        try {
            const blog_id = params.get("id");
            const response = await axios.post(`${config.API_BASE_URL}api/update_emotion`, { blog_id, like, dislike }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = response.data.result;

        } catch (error) {
            console.error('Error fetching blog:', error);
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
        if (!liked) {
            update_emotion(String(curlike + 1), String(curdislike));
            update_user_emotion('like');
            setLiked(true);
            if (disliked) {
                setCurdislike(curdislike - 1);
                update_emotion(String(curlike + 1), String(curdislike - 1));
                setDisliked(false);
            }
            setCurlike(curlike + 1);
        } else {
            update_emotion(String(curlike - 1), String(curdislike));
            update_user_emotion('like');
            setCurlike(curlike - 1);
            setLiked(false);
        }
    };
    
    const handleDislike = async () => {
        if (!disliked) {
            update_emotion(String(curlike), String(curdislike + 1));
            update_user_emotion('dislike');
            setDisliked(true);
            if (liked) {
                console.log(String(curdislike + 1));
                setCurlike(curlike - 1);
                update_emotion(String(curlike - 1), String(curdislike + 1));
                setLiked(false);
            }
            setCurdislike(curdislike + 1);
        } else {
            update_emotion(String(curlike), String(curdislike - 1));
            update_user_emotion('dislike');
            setCurdislike(curdislike - 1);
            setDisliked(false);
        }
    };
    

    useEffect(() => {
        get_blog();
        get_user_emotion();
    }, []);

    return (
        <div>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Author:</strong> {author}</p>
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
        </div>
    );
};

export default Blogdetail;
