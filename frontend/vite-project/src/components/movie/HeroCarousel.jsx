import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Ticket, Film, Sparkles } from 'lucide-react';
import Button from '../common/Button.jsx';

export const HeroCarousel = ({ movies = [], loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const items = movies && movies.length > 0 ? movies.slice(0, 5) : [];

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
      <div className="w-full h-[220px] sm:h-[300px] md:h-[400px] bg-navy-light animate-pulse rounded-none sm:rounded-lg overflow-hidden flex items-center justify-center">
        <Film className="w-12 h-12 text-white/20" />
      </div>
    );
  }

  // Fallback when no featured movies available
  if (items.length === 0) {
    return (
      <div className="relative w-full h-[200px] sm:h-[260px] md:h-[340px] bg-gradient-to-r from-navy via-navy-light to-navy rounded-none sm:rounded-lg overflow-hidden flex items-center px-6 sm:px-12 text-white">
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

  const currentMovie = items[currentIndex];
  const movieId = currentMovie._id || currentMovie.id;
  const languages = Array.isArray(currentMovie.languages)
    ? currentMovie.languages.join(', ')
    : currentMovie.languages || '';
  const formats = Array.isArray(currentMovie.formats)
    ? currentMovie.formats.join(' • ')
    : currentMovie.formats || '2D';
  const backdrop = currentMovie.backdropUrl || currentMovie.posterUrl;

  return (
    <div
      className="relative w-full h-[240px] sm:h-[320px] md:h-[400px] bg-black rounded-none sm:rounded-lg overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slides */}
      {items.map((movie, idx) => {
        const isActive = idx === currentIndex;
        const bgImg = movie.backdropUrl || movie.posterUrl;
        return (
          <div
            key={movie._id || movie.id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Backdrop Image */}
            {bgImg ? (
              <img
                src={bgImg}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-navy to-navy-light" />
            )}

            {/* Dark Multi-stop Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
          </div>
        );
      })}

      {/* Slide Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-center px-6 sm:px-12 md:px-16 pointer-events-none">
        <div className="max-w-xl text-white space-y-2 sm:space-y-3 pointer-events-auto">
          {/* Format / Certificate Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {currentMovie.certificate && (
              <span className="px-2 py-0.5 rounded-xs bg-white/20 backdrop-blur-xs font-bold uppercase tracking-wider text-[11px]">
                {currentMovie.certificate}
              </span>
            )}
            {formats && (
              <span className="px-2 py-0.5 rounded-xs bg-primary/80 font-semibold text-[11px]">
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
            {currentMovie.title}
          </h2>

          {/* Description Preview */}
          {currentMovie.description && (
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-lg leading-relaxed drop-shadow">
              {currentMovie.description}
            </p>
          )}

          {/* Action Button */}
          <div className="pt-1 sm:pt-2">
            <Link to={`/movies/${movieId}`}>
              <Button
                variant="primary"
                size="md"
                className="gap-2 shadow-lg hover:shadow-primary/40 font-bold"
              >
                <Ticket className="w-4 h-4" />
                Book Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Left / Right Nav Arrows (Desktop group hover) */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-30 flex items-center justify-center gap-1.5 sm:gap-2">
          {items.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
