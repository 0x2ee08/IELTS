// import React, { useState, useEffect } from 'react';
// import './customPagination.css';

// interface CustomPaginationProps {
//     total: number;
//     currentPage: number;
//     queuePage: boolean;
//     onPageChange: (page: number) => void;
// }

// const CustomPagination: React.FC<CustomPaginationProps> = ({ total, currentPage, onPageChange, queuePage }) => {
//     const [prevPage, setPrevPage] = useState<number>(currentPage);
//     const labels = Array.from({ length: total }, (_, idx) => `${String.fromCharCode(65 + idx)}`);

//     useEffect(() => {
//         setPrevPage(currentPage);
//     }, [currentPage]);

//     return (
//         <div className="pagination-container">
//             {labels.map((label, idx) => (
//                 <button
//                     key={idx}
//                     onClick={() => onPageChange(idx)}
//                     className={`pagination-button ${idx === currentPage ? 'current-page' : ''} ${prevPage === idx ? 'fade-in fade-in-active' : ''}`}
//                     style={{ animation: prevPage === idx ? 'fadeIn 0.3s ease' : 'none' }}
//                 >
//                     {label}
//                 </button>
//             ))}
//             {/* Add the "Ranking" button at the end */}
//             {/* <button
//                 onClick={() => onPageChange(total)} // Assuming the "Ranking" is treated as the next page
//                 className={`pagination-button ${currentPage === total ? 'current-page' : ''} ${prevPage === total ? 'fade-in fade-in-active' : ''}`}
//                 style={{ animation: prevPage === total ? 'fadeIn 0.3s ease' : 'none' }}
//             >
//                 Ranking
//             </button> */}
//             {queuePage
//                 ? <button
//                     onClick={() => onPageChange(total + 1)} // Assuming the "Ranking" is treated as the next page
//                     className={`pagination-button ${currentPage === total + 1 ? 'current-page' : ''} ${prevPage === total + 1 ? 'fade-in fade-in-active' : ''}`}
//                     style={{ animation: prevPage === total + 1 ? 'fadeIn 0.3s ease' : 'none' }}
//                 >
//                     Queue
//                 </button>
//                 : null
//             }
            
//         </div>
//     );
// };

// export default CustomPagination;

import React from 'react';
import './customPagination.css'; // Import your custom CSS

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