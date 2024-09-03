'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
import axios from 'axios';

const BlogsCreator: React.FC = () => {
    const [bloglist, setBloglist] = useState<string[]>([]);
    const [authorlist, setAuthorlist] = useState<string[]>([]);
    const [idlist, setIdlist] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [blog_id, setblog_id] = useState('');
    const router = useRouter();

    const createBlog = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/create_blog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content, blog_id }),
        });
        const result = await response.json();
        if (response.ok) {
            alert('Blog created successfully');
            setTitle('');
            setContent('');
            setblog_id('');
            router.push(`/blog_loader?id=${result.blog_id}`);
        } else {
            alert('Error creating blog: ' + result.error);
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="container mx-auto p-4">
                <h2>Create New Blog</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title (cannot be empty)"
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

            <Footer />
        </div>
    );
};

export default BlogsCreator;
