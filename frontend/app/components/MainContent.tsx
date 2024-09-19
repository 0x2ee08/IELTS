import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import dayjs from 'dayjs';
import Link from 'next/link';

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

interface Contest {
  id: string;
  type: string;
  problemName: string;
  startTime: string;
  endTime: string;
  created_by: string;
  access: string;
  registerUser: number;
}

const MainContent: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [upcomingContest, setUpcomingContest] = useState<Contest[] | null>(null);
  const [pastContest, setUppastContest] = useState<Contest[] | null>(null);
  const [countdowns, setCountdowns] = useState<string[]>([]);

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

  const handleRegister = (contestId: string) => {
    console.log(`Registering for contest with ID: ${contestId}`);
  };

  useEffect(() => {
    get_home_page_bloglist();

    const token = localStorage.getItem('token');
    axios.get(`${config.API_BASE_URL}api/getAllContest`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => {
        const contests = Object.values(response.data) as Contest[];
        const currentTime = new Date();

        // Upcoming contest filter
        const upcoming = contests.filter((contest: Contest) => {
          const cst = new Date(contest.startTime);
          return cst > currentTime;
        });

        const pastcontest = contests.filter((contest: Contest) => {
          const cst = new Date(contest.endTime);
          return cst < currentTime;
        });

        setUpcomingContest(upcoming);
        setUppastContest(pastcontest);
      })
      .catch(error => {
        console.error('Error fetching contests:', error);
      });
  }, []);

  useEffect(() => {
    if (upcomingContest) {
      const updateCountdowns = () => {
        const updatedCountdowns = upcomingContest.map(contest => {
          return timeleft(contest.startTime);
        });
        setCountdowns(updatedCountdowns);
      };

      updateCountdowns(); // Initial update
      const interval = setInterval(updateCountdowns, 1000);

      // Cleanup on component unmount
      return () => clearInterval(interval);
    }
  }, [upcomingContest]);

  const timediff = (startTimeISO: string, endTimeISO: string): string => {
    const startTime = new Date(startTimeISO);
    const endTime = new Date(endTimeISO);
    const diffInMs = endTime.getTime() - startTime.getTime();

    if (diffInMs <= 0) return `0 giây`;
    
    const seconds = Math.floor((diffInMs / 1000) % 60);
    const minutes = Math.floor((diffInMs / 60000) % 60);
    const hours = Math.floor((diffInMs / 360000) % 24);
    const days = Math.floor(diffInMs / 8640000);

    if (days > 0) return `${String(days)} ngày ${String(hours).padStart(2, '0')} tiếng ${String(minutes).padStart(2, '0')} phút ${String(seconds).padStart(2, '0')} giây`;
    if (hours > 0) return `${String(hours).padStart(2, '0')} tiếng ${String(minutes).padStart(2, '0')} phút ${String(seconds).padStart(2, '0')} giây`;
    if (minutes > 0) return `${String(minutes).padStart(2, '0')} phút ${String(seconds).padStart(2, '0')} giây`;

    return `${String(seconds).padStart(2, '0')} giây`;
  };

  const timeleft = (timeISO: string): string => {
    const d = new Date().toISOString();
    return timediff(d, timeISO);
  };

  const tformatVirtual = (startTimeISO: string, endTimeISO: string): string => {
    const startTime = new Date(startTimeISO);
    const endTime = new Date(endTimeISO);
    
    const days = Math.floor((endTime.getTime() - startTime.getTime()) / 8640000);
    if (days > 1) return `${String(days)} ngày`;
    return timediff(startTimeISO, endTimeISO);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-8 px-8 lg:px-12 py-8">
      {/* Left Section: Upcoming Contest and Virtual Tests */}
      <div className="flex-1 space-y-8">
        {/* Upcoming Contest */}
        <section className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold">UPCOMING CONTEST</h2>
            {upcomingContest ? upcomingContest.map((contest, cnt) =>
              <div key={cnt}>
                <div className="bg-white-100 p-6 rounded-lg mt-4 border border-black">
                  <h3 className="font-bold text-xl">{contest.problemName}</h3>
                  <p className="text-gray-600">Bắt đầu trong: <span className="font-semibold text-[#0077B6]">{countdowns[cnt]}</span></p>
                  <div className="flex justify-end mt-4">
                    <button 
                      className="px-8 py-3 bg-[#0077B6] text-white rounded-lg hover:shadow-xl hover:bg-[#005f89] transition-all duration-300 ease-in-out transform hover:scale-95"
                      onClick={() => handleRegister(contest.id)}
                    >
                      Đăng ký
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
        </section>

        {/* Virtual Tests */}
        <section className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">VIRTUAL TESTS</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-1 bg-white text-[#0077B6] rounded-lg border border-[#0077B6] hover:bg-[#0077B6] hover:text-white hover:border-white transition-all duration-300 ease-in-out hover:shadow-lg">
                    Latest
                  </button>
                  <button className="px-4 py-1 bg-white text-[#0077B6] rounded-lg border border-[#0077B6] hover:bg-[#0077B6] hover:text-white hover:border-white transition-all duration-300 ease-in-out hover:shadow-lg">
                    Difficulty
                  </button>
                  <button className="px-4 py-1 bg-white text-[#0077B6] rounded-lg border border-[#0077B6] hover:bg-[#0077B6] hover:text-white hover:border-white transition-all duration-300 ease-in-out hover:shadow-lg">
                    Progress
                  </button>
                  <button className="text-gray-500">&#128269;</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {pastContest ? pastContest.map((contest, index) => (
                    <Link href={`/contests/${contest.id}`} key={index} className="cursor-pointer border border-black rounded-lg p-4 shadow hover:shadow-lg transition">
                        <h3 className="font-semibold text-[#0077B6] hover:underline">{contest.problemName}</h3>
                        <p className="text-gray-500">{tformatVirtual(contest.startTime, contest.endTime)}</p>
                        <p className="text-gray-500">32 bài nộp</p>
                        <p className="text-gray-500">4301 bình luận</p>
                        <p className="text-blue-500 mt-2">40 Câu hỏi</p>
                    </Link>
                )) : (
                  <p>Loading...</p>
                )}

                
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
