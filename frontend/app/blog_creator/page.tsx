'use client'
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css'; 
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


const BlogsCreator: React.FC = () => {
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
        <MarkdownEditor
            value={content}
            style={{height: '500px'}}
            renderHTML={(text) => mdParser.render(text)}
            onChange={({ text }) => setContent(text)}
            className="mb-4"
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
