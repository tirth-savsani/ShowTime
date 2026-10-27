import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Film, Loader2, Star } from 'lucide-react';
import moviesApi from '../../api/movies.api.js';

export const SearchBar = ({ className = '' }) => {
  const { selected: selectedCity } = useSelector((state) => state.city);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  // 300ms debounce auto-suggest (Spec C3, C5, Phase 4)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await moviesApi.suggest(query.trim());
        // Response is unwrapped by axios interceptor (either { items } or array)
        const movies = Array.isArray(response)
          ? response
          : response?.items || response?.suggestions || [];
        setResults(movies);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation (Spec C5: Up/Down moves, Enter opens, Esc closes)
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectMovie(results[selectedIndex]._id || results[selectedIndex].id);
      } else if (query.trim()) {
        navigate(`/explore/movies?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectMovie = (id) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/movies/${id}`);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[560px] ${className}`}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for Movies, Theatres and more"
          className="w-full h-10 pl-10 pr-10 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink placeholder:text-muted transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 w-4 h-4 text-muted animate-spin" />
        )}
      </div>

      {/* Live Search Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-sm shadow-hover z-50 overflow-hidden max-h-[380px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-1 divide-y divide-gray-50">
              {results.map((movie, idx) => {
                const id = movie._id || movie.id;
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={id}
                    onClick={() => handleSelectMovie(id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-red-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-xs bg-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-100 rounded-xs flex items-center justify-center text-muted flex-shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-ink truncate">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {(movie.genres || []).join(', ') || 'Feature Film'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-ink rounded-xs font-semibold">
                          {movie.certificate || 'UA'}
                        </span>
                        {movie.rating ? (
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {Number(movie.rating).toFixed(1)}
                          </span>
                        ) : null}
                        <span className="text-[11px] text-muted truncate">
                          {(movie.languages || []).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loading ? (
            <div className="p-4 text-center text-sm text-muted">
              No results for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
