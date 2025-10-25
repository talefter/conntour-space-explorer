import React from 'react';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Paginator: React.FC<PaginatorProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const visiblePages = getVisiblePages();
  const firstVisible = visiblePages[0];
  const lastVisible = visiblePages[visiblePages.length - 1];
  const isDisabled = totalPages <= 1;

  return (
    <div className="paginator">
      <button
        className="paginator__btn"
        disabled={currentPage === 1 || isDisabled}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      
      {firstVisible > 1 && !isDisabled && (
        <>
          <button className="paginator__btn" onClick={() => onPageChange(1)}>1</button>
          {firstVisible > 2 && <span className="paginator__ellipsis">...</span>}
        </>
      )}
      
      {visiblePages.map((page) => (
        <button
          key={page}
          className={`paginator__btn ${page === currentPage ? 'paginator__btn--active' : ''}`}
          disabled={isDisabled}
          onClick={() => !isDisabled && onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      {lastVisible < totalPages && !isDisabled && (
        <>
          {lastVisible < totalPages - 1 && <span className="paginator__ellipsis">...</span>}
          <button className="paginator__btn" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      
      <button
        className="paginator__btn"
        disabled={currentPage === totalPages || isDisabled}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};