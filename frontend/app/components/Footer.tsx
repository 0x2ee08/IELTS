// components/Footer.tsx

import Link from 'next/link';
import React from 'react';
  
const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-50 bg-opacity-90 text-black z-20">
            <div className="text-center py-4 text-gray-600 text-xs">
          © 2024 Virtual Staging AI™
            </div>
        </footer>
    );
};

export default Footer;