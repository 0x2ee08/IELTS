'use client'

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type NavLinkProps = {
    href: string;
    text: string;
    isButton?: boolean;
};

const NavLink: React.FC<NavLinkProps> = ({ href, text, isButton }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const baseClasses = "px-3 py-1 rounded-lg transition-transform duration-300 ease-in-out text-sm";
    const activeClasses = "bg-gray-200 text-black";
    const linkClasses = "text-[#03045E] hover:bg-gray-100 hover:scale-105 hover:shadow-md hover:shadow-[#00B4D8]/50 hover:translate-y-[-2px]"; 
    const buttonClasses = "bg-white text-[#00B4D8] border border-[#00B4D8] hover:bg-[#00B4D8] hover:text-white hover:scale-105";

    return (
        <Link href={href} passHref>
            <button className={`${baseClasses} ${isButton ? buttonClasses : linkClasses} ${isActive && !isButton ? activeClasses : ''}`}>
                {text}
            </button>
        </Link>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);

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
        if (typeof window !== 'undefined'){
            window.location.href = '/login';
        }
    };

    return (
        <header className="sticky top-0 bg-white dark:bg-gray-400 bg-opacity-90 backdrop-blur-sm text-black shadow-sm z-50">
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
                        <NavLink href="/reading" text="Reading" />
                        <NavLink href="/listening" text="Listening" />
                        <NavLink href="/writing" text="Writing" />
                        <NavLink href="/speaking" text="Speaking" />
                        <NavLink href="/contests" text="Contests" />
                        <NavLink href="/flashcards" text="Flash Cards" />
                        <NavLink href="/blogs" text="Blogs" />
                        <NavLink href="/about" text="About" />

                        {username && (role === 'admin' || role === 'teacher') ? (
                            <>
                                <NavLink href="/management" text="Dashboard" />
                            </>
                        ) : null}

                        {username ? (
                            <>
                                <NavLink href="/profile" text={username} />
                                <button 
                                    onClick={handleLogout} 
                                    className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-700 transition-colors">
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
