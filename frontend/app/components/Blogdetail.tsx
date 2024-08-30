import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ContestDetails.module.css';
import config from '../config';
import { useSearchParams } from "next/navigation";

const Blogdetail: React.FC = () => {
    const params = useSearchParams();
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ author, setAuthor ] = useState('');

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

        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('internal server error');
        }
    };

    useEffect(() => {
        get_blog();
    }, []);

    return (
        <div>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Author:</strong> {author}</p>
            <p><strong>Content:</strong> {content}</p>
        </div>
    );
};

export default Blogdetail;