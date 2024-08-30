import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useSearchParams } from "next/navigation";

const Blogdetail: React.FC = () => {
    const params = useSearchParams();
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ author, setAuthor ] = useState('');
    const [ curlike, setCurlike ] = useState(0);
    const [ curdislike, setCurdislike ] = useState(0);
    const [ liked, setLiked ] = useState(false);
    const [ disliked, setDisliked ] = useState(false);

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
            alert('internal server error');
        }
    };

    const handleLike = async () => {

    }

    useEffect(() => {
        get_blog();
    }, []);

    return (
        <div>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Author:</strong> {author}</p>
            <p><strong>Content:</strong> {content}</p>
            <button 
                onClick={handleLike}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Like {curlike}
            </button>
        </div>
    );
};

export default Blogdetail;