import React, { useState, useEffect } from 'react';
import '../cssCustomFiles/customPagination.css';

interface CustomPaginationProps {
    total: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({ total, currentPage, onPageChange }) => {
    const [prevPage, setPrevPage] = useState<number>(currentPage);
    const labels = Array.from({ length: total }, (_, idx) => `Task ${String.fromCharCode(65 + idx)}`);

    useEffect(() => {
        setPrevPage(currentPage);
    }, [currentPage]);

    return (
        <div className="pagination-container">
            {labels.map((label, idx) => (
                <button
                    key={idx}
                    onClick={() => onPageChange(idx)}
                    className={`pagination-button ${idx === currentPage ? 'current-page' : ''} ${prevPage === idx ? 'fade-in fade-in-active' : ''}`}
                    style={{ animation: prevPage === idx ? 'fadeIn 0.3s ease' : 'none' }}
                >
                    {label}
                </button>
            ))}
            {/* Add the "Ranking" button at the end */}
            <button
                onClick={() => onPageChange(total)} // Assuming the "Ranking" is treated as the next page
                className={`pagination-button ${currentPage === total ? 'current-page' : ''} ${prevPage === total ? 'fade-in fade-in-active' : ''}`}
                style={{ animation: prevPage === total ? 'fadeIn 0.3s ease' : 'none' }}
            >
                Ranking
            </button>
            <button
                onClick={() => onPageChange(total + 1)} // Assuming the "Ranking" is treated as the next page
                className={`pagination-button ${currentPage === total + 1 ? 'current-page' : ''} ${prevPage === total + 1 ? 'fade-in fade-in-active' : ''}`}
                style={{ animation: prevPage === total + 1 ? 'fadeIn 0.3s ease' : 'none' }}
            >
                Queue
            </button>
        </div>
    );
};

export default CustomPagination;
