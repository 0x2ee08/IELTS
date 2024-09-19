'use client';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import config from '../config';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Assuming you're using ReactMarkdown to render blog content
import rehypeRaw from 'rehype-raw'; // To safely render raw HTML in 
import markdownIt from 'markdown-it';
import style from '../components/blog/react-markdown-styles.module.css';

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

const BlogsPage: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]); // Change to an array to hold blog data

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

            // Update blogs state with the full blog list, including title, content, and author
            setBlogs(result.bloglist);
        } catch (error) {
            console.error('Error getting list:', error);
            alert('Internal server error');
        }
    };
    
    useEffect(() => {
        get_blog_list();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div
            style={{
                maxWidth: '100%', // Adjust this as needed to fit your layout
                paddingLeft: '100px', // Padding on all sides
                paddingRight: '300px'
            }}

            > {/* Centering content */}





                <a href={`/blog_creator`} className="text-sm text-blue-500 hover:underline">
                    Create New Blog?
                </a>




                {blogs.map((blog, idx) => {
                    const link = `/loader/blog?id=${blog.blog_id}`;
                    return (
                        <div>
                            <div className="h-px bg-[#d0d0d0] my-1"></div> 
                            <a href={link}>
                            <div key={idx} 
                                className="bg-white hover:bg-gray-100 p-4 rounded-lg"
                            > {/* Center-align each blog post */}
                                <p className="text-2xl text-[#0077B6] font-bold">{blog.title} </p>
                                <div className="text-sm text-gray-600 mb-2">
                                    By {blog.author} on {new Date(blog.time_created).toLocaleDateString()}
                                </div>
                                {/* Render full content */}
                                <div className="border-l-4 border-gray-500 pl-4 mb-4"> 
                                    <ReactMarkdown
                                    rehypePlugins={[rehypeRaw]}
                                    className={style.reactMarkDown}
                                    >
                                        {mdParser.render(blog.content)}
                                    </ReactMarkdown>
                                </div>
                            </div>  
                            </a>
                        </div>
                    );
                })}
            </div>

            <Footer />
        </div>
    );
};

export default BlogsPage;