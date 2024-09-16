'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WritingPage: React.FC = () => {
    const router = useRouter();
    const [showTasks, setShowTasks] = useState(false);

    const handleDropdownClick = () => {
        setShowTasks(!showTasks);
    };

    
    const handleEnterTask = (task: string) => {
        router.push(`/writing/${task}`);
    };

    return (
        <div className='flex flex-col min-h-screen'>
            <Header />
            
            <div style={{paddingLeft:'5%',paddingRight:'5%',marginTop:"25px"}}>
                <section className='relative bg-white-100 p-4 text-center rounded-lg' style={{ background: "rgba(245,250,250,255)", paddingLeft: '5%', paddingRight: '5%', marginTop: "25px" }}>
                    <h1 className='font-extrabold' style={{ fontSize: "33px", padding: "30px" }}>
                        One of the most accurate IELTS Essay checker online
                    </h1>

                    {/* Dropdown at the bottom */}
                    <div className="relative">
                        {/* Dropdown Button */}
                        <div className="flex justify-center">
                            <button 
                                className="relative w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-all duration-700 ease-in-out"
                                onClick={handleDropdownClick}
                                aria-expanded={showTasks} // Accessibility: indicates whether the dropdown is open or not
                                aria-controls="dropdown-menu" // Accessibility: associates button with the dropdown menu
                            >
                                <svg
                                    className={`w-4 h-4 transform transition-transform duration-300 ${showTasks ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Section Extension with Task Buttons */}
                        <div 
                            id="dropdown-menu"
                            className={`transition-all duration-300 overflow-hidden ${showTasks ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="flex justify-around p-4 bg-white shadow-md rounded-b-lg mt-2" style={{ background: "rgba(245,250,250,255)" }}>
                                <button 
                                    className="font-extrabold px-8 py-3 bg-[#0077B6] text-white rounded-lg hover:shadow-xl hover:bg-[#005f89] transition-all duration-700 ease-in-out transform hover:scale-95"
                                    onClick={() => handleEnterTask('task1')}
                                >
                                    Task 1
                                </button>
                                <button 
                                    className="font-extrabold px-8 py-3 bg-[#0077B6] text-white rounded-lg hover:shadow-xl hover:bg-[#005f89] transition-all duration-300 ease-in-out transform hover:scale-95"
                                    onClick={() => handleEnterTask('task2')}
                                >
                                    Task 2
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default WritingPage;
