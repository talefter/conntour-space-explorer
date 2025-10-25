import React from 'react';


interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="paginator">
      <button
        className="paginator__btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      
      {visiblePages[0] > 1 && (
        <>
          <button 
            className="paginator__btn" 
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className="paginator__ellipsis">...</span>}
        </>
      )}
      
      {visiblePages.map((page) => (
        <button
          key={page}
          className={`paginator__btn ${page === currentPage ? 'paginator__btn--active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="paginator__ellipsis">...</span>
          )}
          <button 
            className="paginator__btn" 
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        className="paginator__btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};