import React from 'react';

interface PaginationProps {
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({ total, currentPage, onPageChange }) => {
  const pageLetters = [];
  const maxPageLettersToShow = 8;

  const indexToLetter = (index: number) => String.fromCharCode(65 + index); // Get letter equivalent

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
    <div className="pagination flex justify-center space-x-2">
      <button
        className="px-2 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
        disabled={currentPage === 0}
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
      >
        Prev
      </button>
      {startPage > 0 && (
        <>
          <button className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300" onClick={() => onPageChange(0)}>
            A
          </button>
          <span className="px-2 py-1">...</span>
        </>
      )}
      {pageLetters.map((pageIndex) => (
        <button
          key={pageIndex}
          className={`px-2 py-1 rounded border ${pageIndex === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => onPageChange(pageIndex)}
        >
          {indexToLetter(pageIndex)}
        </button>
      ))}
      {endPage < total - 1 && (
        <>
          <span className="px-2 py-1">...</span>
          <button className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300" onClick={() => onPageChange(total - 1)}>
            {indexToLetter(total - 1)}
          </button>
        </>
      )}
      <button
        className="px-2 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
        disabled={currentPage === total - 1}
        onClick={() => onPageChange(Math.min(total - 1, currentPage + 1))}
      >
        Next
      </button>
    </div>
  );
};

export default CustomPagination;
