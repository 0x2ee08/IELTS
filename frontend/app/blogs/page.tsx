'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';

const BlogsPage: React.FC = () => {
    const [bloglist, setBloglist] = useState([]);
    const [idlist, setIdlist] = useState([]);

    const get_blog_list = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/get_bloglist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });
            const result = await response.json();
            for(let key in result.bloglist)
                result.bloglist[key] = result.bloglist[key]['title'];
            for(let key in result.idlist)
                result.idlist[key] = result.idlist[key]['blog_id'];
            setBloglist(result.bloglist); 
            setIdlist(result.idlist);
        } catch (error) {
            console.error('Error getting list:', error);
            alert('internal server error');
        }
    };

    useEffect(() => {
        get_blog_list();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            {bloglist.map((blog, idx) => {
                const link = `/load_blogs?id=${idlist[idx]}`;
                return (
                    <p key={idx}>
                        <a href={link} className="text-sm text-blue-500 hover:underline">
                            {blog}
                        </a>
                    </p>
                );
            })}

            <Footer />
        </div>
    );
};

export default BlogsPage;
