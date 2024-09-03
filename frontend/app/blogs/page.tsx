'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
import axios from 'axios';

const BlogsPage: React.FC = () => {
    const [bloglist, setBloglist] = useState<string[]>([]);
    const [authorlist, setAuthorlist] = useState<string[]>([]);
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
            // for (let key in result.bloglist) {
            //     result.bloglist[key] = result.bloglist[key]['title'];
            // }
            const tmpbloglist: string[] = [];
            const tmpauthorlist: string[] = [];
            for (let key in result.bloglist) {
                tmpbloglist.push(result.bloglist[key]['title']);
                tmpauthorlist.push(result.bloglist[key]['author']);
            }
            for (let key in result.idlist) {
                result.idlist[key] = result.idlist[key]['blog_id'];
            }
            setBloglist(tmpbloglist);
            setAuthorlist(tmpauthorlist);
            setIdlist(result.idlist);
        } catch (error) {
            console.error('Error getting list:', error);
            alert('internal server error');
        }
    };

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
            get_blog_list();
        } else {
            alert('Error creating blog: ' + result.error);
        }
    };
    

    useEffect(() => {
        get_blog_list();
        console.log(bloglist);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="container mx-auto p-4">
                <a href={`/blog_creator`} className="text-sm text-blue-500 hover:underline">
                    Create New Blog ?
                </a>
            </div>

            <div className="container mx-auto p-4">
                {bloglist.map((blog, idx) => {
                    const link = `/blog_loader?id=${idlist[idx]}`;
                    return (
                        <p key={idx}>
                            <a href={link} className="text-sm text-blue-500 hover:underline">
                                [{authorlist[idx]}] {blog}
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
