import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MoviePosterCard from './MoviePosterCard.jsx';
import Skeleton from '../common/Skeleton.jsx';

export const MovieRow = ({
  title,
  subtitle,
  seeAllLink,
  movies = [],
  loading = false,
  isRanked = false,
  className = '',
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies, loading]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!loading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section className={`relative my-8 ${className}`}>
      {/* Row Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted mt-0.5">{subtitle}</p>
          )}
        </div>

        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="group flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Scroller Container with Relative Arrows */}
      <div className="relative group/scroller">
        {/* Desktop Round Left Arrow */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={`hidden md:flex absolute -left-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-border shadow-card items-center justify-center text-ink hover:text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Desktop Round Right Arrow */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={`hidden md:flex absolute -right-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-border shadow-card items-center justify-center text-ink hover:text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Horizontal Poster Scroller */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 pt-1 px-1 -mx-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            // Skeleton Cards Row
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`row-skel-${idx}`}
                className="w-[140px] sm:w-[160px] md:w-[220px] flex-shrink-0 snap-start space-y-2.5"
              >
                <Skeleton variant="poster" />
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            ))
          ) : (
            movies.map((movie, idx) => (
              <div
                key={movie._id || movie.id}
                className="w-[140px] sm:w-[160px] md:w-[220px] flex-shrink-0 snap-start"
              >
                <MoviePosterCard movie={movie} rank={isRanked ? idx + 1 : null} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
