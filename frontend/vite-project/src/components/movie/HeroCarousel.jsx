import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Ticket, Film, Sparkles, Star } from 'lucide-react';
import Button from '../common/Button.jsx';

export const HeroCarousel = ({ movies = [], loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const items = movies && movies.length > 0 ? movies.slice(0, 7) : [];

  // Auto-slide every 5 seconds (paused on hover)
  useEffect(() => {
    if (items.length <= 1 || isPaused || loading) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, isPaused, loading]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  // Fallback when loading
  if (loading) {
    return (
      <div className="w-full h-[220px] sm:h-[320px] md:h-[400px] bg-navy-light/40 animate-pulse rounded-xl overflow-hidden flex items-center justify-center">
        <Film className="w-12 h-12 text-muted/30" />
      </div>
    );
  }

  // Fallback when no featured movies available
  if (items.length === 0) {
    return (
      <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] bg-gradient-to-r from-navy via-navy-light to-navy rounded-xl overflow-hidden flex items-center px-6 sm:px-12 text-white">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ShowTime Cinemas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            The Ultimate Cinematic Experience
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Atomic 5-minute seat locking, IMAX 3D, and instant verified bookings.
          </p>
          <Link to="/explore/movies">
            <Button variant="primary" size="sm" className="mt-2">
              Explore All Movies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden select-none py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 3-Slide Peek Track */}
      <div
        className="flex items-center transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(calc(10% - ${currentIndex * 80}% - ${currentIndex * 16}px))`,
        }}
      >
        {items.map((movie, idx) => {
          const isActive = idx === currentIndex;
          const movieId = movie._id || movie.id;
          const bgImg = movie.backdropUrl || movie.posterUrl;
          const languages = Array.isArray(movie.languages)
            ? movie.languages.join(', ')
            : movie.languages || '';
          const formats = Array.isArray(movie.formats)
            ? movie.formats.join(' • ')
            : movie.formats || '2D';

          return (
            <div
              key={movieId || idx}
              onClick={() => {
                if (!isActive) setCurrentIndex(idx);
              }}
              className={`w-[80%] shrink-0 mr-4 h-[220px] sm:h-[320px] md:h-[400px] rounded-xl overflow-hidden relative transition-all duration-500 ease-out cursor-pointer ${
                isActive
                  ? 'opacity-100 scale-100 shadow-2xl z-10 cursor-default'
                  : 'opacity-50 scale-95 hover:opacity-75'
              }`}
            >
              {/* Slide Backdrop Image */}
              {bgImg ? (
                <img
                  src={bgImg}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-navy to-navy-light" />
              )}

              {/* Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />

              {/* Inactive Overlay Tint */}
              {!isActive && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
              )}

              {/* Content Overlay */}
              <div
                className={`absolute inset-0 z-20 flex items-center px-6 sm:px-12 md:px-14 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="max-w-xl text-white space-y-2 sm:space-y-3">
                  {/* Format & Certificate Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {movie.certificate && (
                      <span className="px-2 py-0.5 rounded-xs bg-white/20 backdrop-blur-xs font-bold uppercase tracking-wider text-[10px]">
                        {movie.certificate}
                      </span>
                    )}
                    {formats && (
                      <span className="px-2 py-0.5 rounded-xs bg-primary/90 font-semibold text-[10px] uppercase">
                        {formats}
                      </span>
                    )}
                    {languages && (
                      <span className="text-gray-300 text-xs hidden sm:inline">
                        {languages}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
                    {movie.title}
                  </h2>

                  {/* Star Rating Badge */}
                  {movie.rating ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/50 px-2 py-1 rounded-sm border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(movie.rating).toFixed(1)}/10</span>
                      </span>
                      {movie.votes && (
                        <span className="text-gray-300 text-xs">
                          ({Number(movie.votes).toLocaleString('en-IN')} Votes)
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* Description Preview */}
                  {movie.description && (
                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-lg leading-relaxed drop-shadow">
                      {movie.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="pt-1 sm:pt-2">
                    <Link to={`/movies/${movieId}`}>
                      <Button
                        variant="primary"
                        size="md"
                        className="gap-2 shadow-lg hover:shadow-primary/40 font-bold px-5"
                      >
                        <Ticket className="w-4 h-4" />
                        Book Tickets
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left / Right Chevron Controls */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/85 text-white flex items-center justify-center transition-all backdrop-blur-xs shadow-lg hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/85 text-white flex items-center justify-center transition-all backdrop-blur-xs shadow-lg hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3">
          {items.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
