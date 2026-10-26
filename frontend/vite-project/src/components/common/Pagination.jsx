import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page = 1, pages = 1, onPageChange, className = '' }) => {
  if (pages <= 1) return null;

  // Build range of page numbers to display with ellipses
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 sm:gap-2 my-8 ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center justify-center w-9 h-9 rounded-sm border border-border text-ink bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((p, idx) => {
        if (p === '...') {
          return (
            <span
              key={`dots-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-muted text-sm font-medium select-none"
            >
              ...
            </span>
          );
        }

        const isCurrent = p === page;
        return (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-sm text-sm font-semibold transition-colors cursor-pointer ${
              isCurrent
                ? 'bg-primary text-white shadow-xs'
                : 'border border-border text-ink bg-white hover:bg-gray-50'
            }`}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="flex items-center justify-center w-9 h-9 rounded-sm border border-border text-ink bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
