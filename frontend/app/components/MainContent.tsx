import React from 'react';
import './App.css'; // Make sure to create and style this CSS file as per your design requirements
import Link from 'next/link'


const MainContent: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-8 px-4 lg:px-0">
    {/* Left Section: Upcoming Contest and Virtual Tests */}
    <div className="flex-1 space-y-8">
        {/* Upcoming Contest */}
        <section className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">UPCOMING CONTEST</h2>
            <div className="bg-blue-100 p-4 rounded-lg mt-4 shadow-lg">
                <h3 className="font-bold text-xl">Reading Skill (AI generated contest) #01</h3>
                <p className="text-gray-600">Bắt đầu trong: <span className="font-semibold">2 ngày 3 tiếng 5 phút 23 giây</span></p>
                <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg">Đăng ký</button>
            </div>
        </section>

        {/* Virtual Tests */}
        <section className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">VIRTUAL TESTS</h2>
                <div className="flex space-x-2">
                    <button className="text-blue-500">Latest</button>
                    <button className="text-gray-500">Difficulty</button>
                    <button className="text-gray-500">Progress</button>
                    <button className="text-gray-500">&#128269;</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Test Card */}
                {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                        <h3 className="font-semibold text-blue-800">IELTS Cambridge 12 Listening</h3>
                        <p className="text-gray-500">40 phút</p>
                        <p className="text-gray-500">32 bài nộp</p>
                        <p className="text-gray-500">4301 bình luận</p>
                        <p className="text-blue-500 mt-2">40 câu hỏi</p>
                    </div>
                ))}
            </div>
            <button className="mt-4 text-blue-500">READ MORE</button>
        </section>
    </div>

    {/* Right Section: Recent Blogs */}
    <aside className="w-full lg:w-1/3">
        <section className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">RECENT BLOGS</h2>
            <div className="space-y-4 mt-4">
                {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="flex flex-col">
                        <a href="#" className="text-blue-500 hover:underline">Why my writing can’t score higher than 7.0? Help me improve.</a>
                        <div className="text-gray-500 text-sm flex space-x-2">
                            <span>@riihime196</span>
                            <span>10:51 28/08/2024 | one minute ago</span>
                            <span>2405 &#128065;</span>
                            <span>3 &#128172;</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="mt-4 text-blue-500">READ MORE</button>
        </section>
    </aside>
</div>
  );
};

export default MainContent;