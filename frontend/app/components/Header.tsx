// app/componentsHeader.tsx
'use client'

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type NavLinkProps = {
    href: string;
    text: string;
};

const NavLink: React.FC<NavLinkProps> = ({ href, text }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const baseClasses = "px-4 py-2 rounded transition-colors";
    const activeClasses = "bg-gray-200 text-black";
    const inactiveClasses = "hover:bg-gray-100 hover:text-gray-800";
    const customStyles = "bg-[#03045E] text-white hover:bg-blue-800";

    return (
        <Link href={href} passHref>
            <button className={`${baseClasses} ${isActive ? activeClasses : customStyles}`}>
                {text}
            </button>
        </Link>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        // Optionally, redirect to home page or login page
    };

    return (
        <header className="sticky top-0 bg-white dark:bg-gray-400 bg-opacity-90 backdrop-blur-sm text-black shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-5">
                    {/* Logo and left-side menu button */}
                    <div className="flex items-center space-x-8">
                        <Link href="/">
                            <button className="text-2xl font-bold text-blue-900">IELTS TESTING</button>
                        </Link>
                        <button className="text-3xl md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            &#9776;
                        </button>
                    </div>
                    
                    {/* Right-side links */}
                    
                    <nav className={`space-x-4 ${isMenuOpen ? 'block' : 'hidden md:flex'}`}>
                        {username ? (
                            <>
                                <NavLink href="/profile"  text={username}/>
                                <button 
                                    onClick={handleLogout} 
                                    className="px-6 py-2 bg-black text-white rounded shadow hover:bg-gray-700 transition-colors">
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink href="/login" text="Login" />
                                <NavLink href="/register" text="Register" />
                            </>
                    )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
