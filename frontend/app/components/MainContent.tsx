import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

interface Blog {
  author: string;
  blog_id: string;
  comments: any[];
  content: string;
  dislike: number;
  like: number;
  time_created: string;
  title: string;
  view: number;
  _id: string;
}

const MainContent: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const get_home_page_bloglist = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${config.API_BASE_URL}api/get_home_page_bloglist`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = response.data.blogs;

      setBlogs(result);

    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  useEffect(() => {
    get_home_page_bloglist();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-8 px-8 lg:px-12 py-8">
      {/* Left Section: Upcoming Contest and Virtual Tests */}
      <div className="flex-1 space-y-8">
        {/* Upcoming Contest */}
        <section className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold">UPCOMING CONTEST</h2>
          <div className="bg-white-100 p-6 rounded-lg mt-4 border border-black">
            <h3 className="font-bold text-xl">Reading Skill (AI generated contest) #01</h3>
            <p className="text-gray-600">Bắt đầu trong: <span className="font-semibold text-[#0077B6]">2 ngày 3 tiếng 5 phút 23 giây</span></p>
            <div className="flex justify-end mt-4">
                <button className="px-8 py-3 bg-[#0077B6] text-white rounded-lg">Đăng ký</button>
            </div>
          </div>
        </section>

        {/* Virtual Tests */}
        <section className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">VIRTUAL TESTS</h2>
                <div className="flex space-x-2">
                    <button className="px-4 py-1 bg-white text-[#0077B6] rounded-lg border border-[#0077B6] hover:bg-[#0077B6] hover:text-white hover:border-white">Lastest</button>
                    <button className="px-4 py-1 bg-white text-[#0077B6] rounded-lg border border-[#0077B6] hover:bg-[#0077B6] hover:text-white hover:border-white">Difficulty</button>
                    <button className="px-4 py-1 bg-white text-[#0077B6] rounded-lg border border-[#0077B6] hover:bg-[#0077B6] hover:text-white hover:border-white">Progress</button>
                    <button className="text-gray-500">&#128269;</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Test Card */}
                {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="border border-black rounded-lg p-4 shadow hover:shadow-lg transition">
                        <h3 className="font-semibold text-[#0077B6]">IELTS Cambridge 12 Listening</h3>
                        <p className="text-gray-500">40 phút</p>
                        <p className="text-gray-500">32 bài nộp</p>
                        <p className="text-gray-500">4301 bình luận</p>
                        <p className="text-blue-500 mt-2">40 câu hỏi</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center mt-4">
                <button className="text-[#0077B6] mr-4">READ MORE</button>
            </div>
        </section>
      </div>

      {/* Right Section: Recent Blogs */}
      <aside className="w-full lg:w-1/3">
        <section className="bg-white p-6 rounded-lg border border-black">
          <h2 className="text-lg font-semibold">RECENT BLOGS</h2>
          <div className="space-y-4 mt-4">
          {blogs.slice(0, Math.min(blogs.length, 10)).map((blog, index) => {
            const link = `/loader/blog?id=${blog.blog_id}`; // Define link outside JSX

            return (
              <div key={index} className="flex flex-col">
                <a href={link} className="text-blue-500 hover:underline">{blog.title}</a>
                <div className="text-gray-500 text-sm flex space-x-2">
                  <span>@{blog.author}</span>
                  <span>{new Date(blog.time_created).toLocaleString()}</span>
                  <span>{blog.view} &#128065;</span>
                  <span>{blog.like - blog.dislike} &#128077;</span>
                </div>
              </div>
            );
          })}
          </div>
          <div className="flex items-center justify-center mt-4">
            <a href="/blogs" className="text-[#0077B6] mr-4">
              READ MORE
            </a>
          </div>
        </section>
      </aside>
    </div>
  );
};

export default MainContent;
