import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import moviesApi from '../api/movies.api.js';
import MoviePosterCard from '../components/movie/MoviePosterCard.jsx';
import FilterSidebar from '../components/movie/FilterSidebar.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected: selectedCity } = useSelector((state) => state.city);

  // Sync state with URL params
  const tab = searchParams.get('tab') || 'now_showing';
  const genre = searchParams.get('genre') || '';
  const language = searchParams.get('language') || '';
  const format = searchParams.get('format') || '';
  const q = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Helper to safely update URL search parameters
  const updateParams = useCallback((newParams) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') {
          updated.delete(k);
        } else {
          updated.set(k, String(v));
        }
      });
      return updated;
    });
  }, [setSearchParams]);

  // Fetch movies whenever filters, tab, city, search, or page changes
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        status: tab,
        page,
        limit: 12,
      };

      if (tab === 'now_showing' && selectedCity) {
        queryParams.city = selectedCity;
      }
      if (genre) queryParams.genre = genre;
      if (language) queryParams.language = language;
      if (format) queryParams.format = format;
      if (q) queryParams.search = q;

      const res = await moviesApi.getMovies(queryParams);
      const items = Array.isArray(res) ? res : res?.items || [];
      const pag = res?.pagination || { page: 1, limit: 12, total: items.length, pages: 1 };

      setMovies(items);
      setPagination(pag);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load movies.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [tab, genre, language, format, q, page, selectedCity]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Filter change handlers
  const handleFilterChange = (category, value) => {
    updateParams({ [category]: value, page: 1 });
  };

  const handleTabChange = (newTab) => {
    if (newTab === tab) return;
    updateParams({ tab: newTab, page: 1 });
  };

  const handleClearAll = () => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams();
      if (prev.get('tab')) updated.set('tab', prev.get('tab'));
      return updated;
    });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active filters count & list
  const activeFilters = [];
  if (language) activeFilters.push({ key: 'language', label: `Language: ${language}` });
  if (genre) activeFilters.push({ key: 'genre', label: `Genre: ${genre}` });
  if (format) activeFilters.push({ key: 'format', label: `Format: ${format}` });
  if (q) activeFilters.push({ key: 'q', label: `Search: "${q}"` });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Top Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Explore Movies
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            {tab === 'now_showing'
              ? selectedCity
                ? `Current movies playing in ${selectedCity}`
                : 'Current movies playing in theatres'
              : 'Upcoming theatrical releases'}
            {pagination.total > 0 && ` (${pagination.total} movies)`}
          </p>
        </div>

        {/* Tabs: Now Showing & Coming Soon */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-md self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleTabChange('now_showing')}
            className={`px-4 py-2 rounded-xs text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'now_showing'
                ? 'bg-white text-primary shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Now Showing
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('coming_soon')}
            className={`px-4 py-2 rounded-xs text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'coming_soon'
                ? 'bg-white text-primary shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden flex items-center justify-between py-3 border-b border-border">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-white text-xs font-semibold text-ink shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span>Filters</span>
          {activeFilters.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary hover:text-primary-dark"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="flex gap-8 pt-6 items-start">
        {/* Left Filter Sidebar */}
        <FilterSidebar
          filters={{ language, genre, format }}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          isMobileOpen={isMobileFilterOpen}
          onMobileClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Movie Grid Area */}
        <div className="flex-1 min-w-0">
          {/* Active Filter Chips Strip */}
          {activeFilters.length > 0 && (
            <div className="hidden lg:flex items-center flex-wrap gap-2 pb-4 mb-4 border-b border-border">
              <span className="text-xs font-semibold text-muted">Applied:</span>
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/25 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  <span>{f.label}</span>
                  <button
                    type="button"
                    onClick={() => updateParams({ [f.key]: '', page: 1 })}
                    className="hover:opacity-75 focus:outline-none"
                    aria-label={`Remove filter ${f.label}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-muted hover:text-primary transition-colors ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid Content / Skeletons / Empty / Error */}
          {error ? (
            <ErrorState
              title="Failed to load movies"
              message={error}
              onRetry={fetchMovies}
            />
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={`explore-skel-${idx}`} className="space-y-2.5">
                  <Skeleton variant="poster" />
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {movies.map((movie) => (
                  <MoviePosterCard key={movie._id || movie.id} movie={movie} />
                ))}
              </div>

              {/* Accessible Pagination */}
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyState
              icon={Filter}
              title="No movies found"
              hint="We couldn't find any movies matching your current filters or search term."
              actionLabel="Clear All Filters"
              onAction={handleClearAll}
              className="bg-white rounded-lg border border-border py-12"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
