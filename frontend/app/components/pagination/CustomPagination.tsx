import React from 'react';
import '../contests/speaking/cssCustomFiles/customPagination.css'; // Import your custom CSS

interface PaginationProps {
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({ total, currentPage, onPageChange }) => {
  const pageLetters = [];
  const maxPageLettersToShow = 5;

  const indexToLetter = (index: number) => String.fromCharCode(65 + index); // Get letter equivalent

  if(total<25) total=total-1;
  let startPage = 0;
  let endPage = total;


  if (total > maxPageLettersToShow) {
    const halfRange = Math.floor(maxPageLettersToShow / 2);
    startPage = Math.max(0, currentPage - halfRange);
    endPage = Math.min(total - 1, currentPage + halfRange);

    if (currentPage - halfRange <= 0) {
      endPage = maxPageLettersToShow - 1;
    }

    if (currentPage + halfRange >= total) {
      startPage = total - maxPageLettersToShow;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageLetters.push(i);
  }

  return (
    <div className="pagination-container">
      {startPage > 0 && (
        <>
          <button className="pagination-button" onClick={() => onPageChange(0)}>
            A
          </button>
          <span className="pagination-button">...</span>
        </>
      )}
      {pageLetters.map((pageIndex) => (
        <button
          key={pageIndex}
          className={`pagination-button ${pageIndex === currentPage ? 'current-page' : ''}`}
          onClick={() => onPageChange(pageIndex)}
        >
          {indexToLetter(pageIndex)}
        </button>
      ))}
      {endPage < total - 1 && (
        <>
          <span className="pagination-button">...</span>
          <button className="pagination-button" onClick={() => onPageChange(total - 1)}>
            {indexToLetter(total - 1)}
          </button>
        </>
      )}
    </div>
  );
};

export default CustomPagination;
