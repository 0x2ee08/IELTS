// app/components/Header.tsx
'use client'

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// NavLink Component
type NavLinkProps = {
    href: string;
    text: string;
    isButton?: boolean;
    customStyles?: string; // Add a prop for custom styles
};

const NavLink: React.FC<NavLinkProps> = ({ href, text, isButton, customStyles }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const baseClasses = "px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out text-sm flex items-center justify-center";
    const activeClasses = "text-blue-500"; // Change color when active
    const linkClasses = "text-black hover:text-blue-500"; // Black by default, blue on hover
    const buttonClasses = "bg-white text-[#00B4D8] border border-[#00B4D8] hover:bg-[#00B4D8] hover:text-white hover:scale-105";
    const customButtonClasses = customStyles ? customStyles : buttonClasses;

    return (
        <Link href={href} passHref>
            <button className={`${baseClasses} ${isButton ? customButtonClasses : linkClasses} ${isActive && !isButton ? activeClasses : ''}`}>
                {text}
            </button>
        </Link>
    );
};


// Header Component
const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredTedTalk, setIsHoveredTedTalk] = useState(false);
    const [isHoveredSubmission, setIsHoveredSubmission] = useState(false);

    useEffect(() => {
        // Check for logged-in user
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUsername(storedUser);
        }
        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        if (token) {
            setIsLoggedIn(true);
            setRole(storedRole);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUsername(null);
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return (
        <header className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm z-50">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-5">
                    {/* Logo and left-side menu button */}
                    <div className="flex items-center justify-start space-x-4">
                        <Link href="/">
                            <button className="text-5xl font-bold" style={{ color: '#03045E' }}>IELTS</button>
                        </Link>
                        <button className="text-3xl md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            &#9776;
                        </button>
                    </div>
                    
                    {/* Right-side links */}
                    <nav className={`md:flex md:space-x-4 ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
                        <NavLink href="/contests" text="Contests" />

                        {username ? (
                            <>
                            <div
                                onMouseEnter={() => setIsHoveredSubmission(true)}
                                onMouseLeave={() => setIsHoveredSubmission(false)}
                                className="relative"
                            >
                                <NavLink 
                                    href="/results"
                                    text="Submissions" 
                                />
                                {isHoveredSubmission && (
                                    <div 
                                        className="absolute bg-white p-4 border-t-10 border-[#00B4D8]" // Blue line on top
                                        style={{ minWidth: '200px' }} // Ensure dropdown has minimum width
                                    >
                                        <div className="space-y-2">
                                            <hr className="border-[#00B4D8] border-t-2" /> 
                                            <NavLink 
                                                href="/results" 
                                                text="My submission" 
                                                customStyles="w-full px-4 py-2 block bg-gray-100 text-center"
                                            />
                                            <hr className="border-[#00B4D8] border-t-2" /> 
                                            {/* Thin line separator */}
                                            <NavLink 
                                                href="/submissions" 
                                                text="All submission" 
                                                customStyles="w-full px-4 py-2 block bg-gray-100 text-center"
                                            />
                                            
                                            {/* Thin line separator */}
                                        </div>
                                    </div>
                                )}
                            </div>
                            </>
                            
                        ) : null}
                        
                        <NavLink href="/blogs" text="Blogs" />
                        
                        <div
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="relative"
                        >
                            <NavLink 
                                href="/writing/task2"
                                text="Writing" 
                            />
                            {isHovered && (
                                <div 
                                    className="absolute bg-white p-4 border-t-10 border-[#00B4D8]" // Blue line on top
                                    style={{ minWidth: '200px' }} // Ensure dropdown has minimum width
                                >
                                    <div className="space-y-2">
                                        <hr className="border-[#00B4D8] border-t-2" /> {/* Thin line separator */}
                                        <NavLink 
                                            href="/writing/task1" 
                                            text="Task 1" 
                                            customStyles="w-full px-4 py-2 block bg-gray-100 text-center"
                                        />
                                        <hr className="border-[#00B4D8] border-t-2" /> {/* Thin line separator */}
                                        <NavLink 
                                            href="/writing/task2" 
                                            text="Task 2" 
                                            customStyles="w-full px-4 py-2 block bg-gray-100 text-center"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <NavLink href="/flashcards" text="Flash Cards" /> */}

                        {/* <div
                                onMouseEnter={() => setIsHoveredTedTalk(true)}
                                onMouseLeave={() => setIsHoveredTedTalk(false)}
                                className="relative"
                            > */}
                                {/* <NavLink 
                                    href="/tedtalk"
                                    text="Ted Talk" 
                                /> */}
                                {isHoveredTedTalk && (<></>
                                    // <div 
                                    //     className="absolute bg-white p-4 border-t-10 border-[#00B4D8]" // Blue line on top
                                    //     style={{ minWidth: '200px' }} // Ensure dropdown has minimum width
                                    // >
                                    //     <div className="space-y-2">
                                    //         <hr className="border-[#00B4D8] border-t-2" /> 
                                    //         <NavLink 
                                    //             href="/tedtalk" 
                                    //             text="All Videos" 
                                    //             customStyles="w-full px-4 py-2 block bg-gray-100 text-center"
                                    //         />
                                    //         <hr className="border-[#00B4D8] border-t-2" /> 
                                    //         {/* Thin line separator */}
                                    //         <NavLink 
                                    //             href="/notes" 
                                    //             text="My Notes" 
                                    //             customStyles="w-full px-4 py-2 block bg-gray-100 text-center"
                                    //         />
                                            
                                    //         {/* Thin line separator */}
                                    //     </div>
                                    // </div>
                                )}
                                
                        {/* </div> */}

                        {username && (role === 'admin' || role === 'teacher') ? (
                            <NavLink href="/management" text="Dashboard" />
                        ) : null}

                        {username ? (
                            <>
                                <NavLink 
                                    href="/profile" 
                                    text={username} 
                                    isButton 
                                    customStyles="bg-[#5B99C2] text-white border border-[#5B99C2] hover:bg-[#4A8CC2] hover:scale-105"
                                />
                                <button 
                                    onClick={handleLogout} 
                                    className="px-4 py-1 bg-white text-[#00B4D8] border border-[#00B4D8] hover:bg-[#00B4D8] hover:text-white hover:scale-105 rounded-lg shadow transition-transform duration-300 ease-in-out flex items-center justify-center font-light text-sm"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <div className="flex space-x-2 ml-auto">
                                <NavLink href="/login" text="Login" isButton />
                                <NavLink href="/register" text="Register" isButton />
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;