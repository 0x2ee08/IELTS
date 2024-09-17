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
        </div>
    );
};

export default CustomPagination;
