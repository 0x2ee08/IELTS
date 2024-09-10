import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <p className="text-xl text-gray-600 mt-2">Oops! Page not found.</p>
            <p className="text-gray-500 mt-4">
                The page you're looking for does not exist or has been moved.
            </p>
            <Link to="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Go back to Home
            </Link>
        </div>
    );
};

export default NotFoundPage;
