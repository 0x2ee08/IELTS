'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
import axios from 'axios';

const BlogsPage: React.FC = () => {
    const [bloglist, setBloglist] = useState([]);
    const [idlist, setIdlist] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [blog_id, setblog_id] = useState('');

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
            for (let key in result.bloglist) {
                result.bloglist[key] = result.bloglist[key]['title'];
            }
            for (let key in result.idlist) {
                result.idlist[key] = result.idlist[key]['blog_id'];
            }
            setBloglist(result.bloglist);
            setIdlist(result.idlist);
        } catch (error) {
            console.error('Error getting list:', error);
            alert('internal server error');
        }
    };

    const createBlog = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/create_blog`, { title, content, blog_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            alert('Blog created successfully');
            setTitle('');
            setContent('');
            setblog_id('');
            get_blog_list();
        } catch (error) {
            console.error('Error creating blog:', error);
            alert('Error creating blog: ' + 'Blog ID already exists');
        }
    };
    

    useEffect(() => {
        get_blog_list();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="container mx-auto p-4">
                <h2>Create New Blog</h2>
                <div className="mb-4">
                <   textarea
                        value={blog_id}
                        onChange={(e) => setblog_id(e.target.value)}
                        rows={1}
                        cols={50}
                        placeholder="Blog ID"
                        className="border p-2 mb-2 w-full"
                    />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="border p-2 mb-2 w-full"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        cols={50}
                        placeholder="Content"
                        className="border p-2 mb-2 w-full"
                    />
                    <button
                        onClick={createBlog}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Create Blog
                    </button>
                </div>
            </div>

            <div className="container mx-auto p-4">
            {bloglist.map((blog, idx) => {
                const link = `/blog_loader?id=${idlist[idx]}`;
                return (
                    <p key={idx}>
                        <a href={link} className="text-sm text-blue-500 hover:underline">
                            [{idlist[idx]}] {blog}
                        </a>
                    </p>
                );
            })}
            </div>

            <Footer />
        </div>
    );
};

export default BlogsPage;
