import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronRight,
  MapPin,
  Clock,
  Coffee,
  Smartphone,
  Calendar,
} from 'lucide-react';
import showsApi from '../api/shows.api.js';
import moviesApi from '../api/movies.api.js';
import { openCityModal } from '../store/slices/citySlice.js';
import DateStrip from '../components/shows/DateStrip.jsx';
import ShowFilters from '../components/shows/ShowFilters.jsx';
import TimePill from '../components/shows/TimePill.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

// Today in YYYY-MM-DD
const getTodayIso = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const Shows = () => {
  const { id: movieId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { selected: selectedCity } = useSelector((state) => state.city);

  const selectedDate = searchParams.get('date') || getTodayIso();

  // State
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side filter states
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');

  // Fetch movie details if not in show payload
  useEffect(() => {
    moviesApi
      .getMovieById(movieId)
      .then((data) => setMovie(data))
      .catch(() => {});
  }, [movieId]);

  // Handle Date Selection from DateStrip
  const handleSelectDate = (newDate) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('date', newDate);
      return next;
    });
  };

  // Fetch Shows from API
  const fetchShows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await showsApi.getShowsByMovie(movieId, {
        date: selectedDate,
        city: selectedCity || '',
      });

      // Response unwrapped: { date, movie, theatres }
      const data = response?.data || response;
      setTheatres(data?.theatres || []);
      if (!movie && data?.movie) {
        setMovie(data.movie);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch showtimes for this date.');
      setTheatres([]);
    } finally {
      setLoading(false);
    }
  }, [movieId, selectedDate, selectedCity, movie]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  // Extract all distinct languages available across all shows today
  const availableLanguages = useMemo(() => {
    const set = new Set();
    theatres.forEach((t) => {
      t.shows?.forEach((s) => {
        if (s.language) set.add(s.language);
      });
    });
    return Array.from(set);
  }, [theatres]);

  // Client-side filtering logic across theatres and their shows
  const filteredTheatres = useMemo(() => {
    return theatres
      .map((item) => {
        const matchingShows = (item.shows || []).filter((show) => {
          // 1. Language Filter
          if (selectedLanguage !== 'all' && show.language !== selectedLanguage) {
            return false;
          }

          // 2. Price Filter
          if (selectedPrice !== 'all') {
            const minPr = show.priceFrom || 0;
            const maxPr = show.priceTo || 0;
            if (selectedPrice === 'under_200' && minPr > 200) return false;
            if (selectedPrice === '200_350' && (maxPr < 200 || minPr > 350)) return false;
            if (selectedPrice === 'above_350' && maxPr < 350) return false;
          }

          // 3. Preferred Time Filter
          if (selectedTime !== 'all') {
            const showHour = new Date(show.startTime).getHours();
            if (selectedTime === 'morning' && showHour >= 12) return false;
            if (selectedTime === 'afternoon' && (showHour < 12 || showHour >= 16)) return false;
            if (selectedTime === 'evening' && (showHour < 16 || showHour >= 19)) return false;
            if (selectedTime === 'night' && showHour < 19) return false;
          }

          return true;
        });

        return {
          ...item,
          shows: matchingShows,
        };
      })
      .filter((item) => item.shows.length > 0);
  }, [theatres, selectedLanguage, selectedPrice, selectedTime]);

  // Duration formatting helper (mins -> "2h 28m")
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const handleResetFilters = () => {
    setSelectedLanguage('all');
    setSelectedPrice('all');
    setSelectedTime('all');
  };

  const title = movie?.title || 'Movie';
  const certificate = movie?.certificate || 'UA';
  const duration = movie?.durationMin ? formatDuration(movie.durationMin) : '';
  const genres = movie?.genres || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Breadcrumb & Movie Header Banner */}
      <div className="bg-navy text-white py-5 border-b border-navy-light">
        <div className="container mx-auto px-4 sm:px-6 space-y-3">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1.5 text-xs text-gray-400"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/explore/movies" className="hover:text-white transition-colors">
              Movies
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/movies/${movieId}`}
              className="hover:text-white transition-colors truncate max-w-[140px] sm:max-w-xs"
            >
              {title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Showtimes</span>
          </nav>

          {/* Title & Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                {certificate && (
                  <span className="px-1.5 py-0.5 rounded-xs bg-white/20 border border-white/30 text-[10px] font-bold uppercase">
                    {certificate}
                  </span>
                )}
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {duration}
                  </span>
                )}
                {genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-gray-300">{genres.join(', ')}</span>
                  </>
                )}
              </div>
            </div>

            {/* City Badge Button */}
            <button
              type="button"
              onClick={() => dispatch(openCityModal())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{selectedCity || 'Change City'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sticky 7-Day Date Strip */}
      <DateStrip
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* 3. Filter Controls Bar */}
      <ShowFilters
        languages={availableLanguages}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        selectedPrice={selectedPrice}
        onSelectPrice={setSelectedPrice}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Availability Legend Strip */}
      <div className="container mx-auto px-4 sm:px-6 pt-4 pb-2 flex flex-wrap items-center justify-end gap-4 text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Filling Fast (&lt;30% left)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span>Sold Out</span>
        </div>
      </div>

      {/* 5. Theatres and Time Pills List */}
      <div className="container mx-auto px-4 sm:px-6 py-4 space-y-4">
        {error ? (
          <ErrorState
            title="Unable to load shows"
            message={error}
            onRetry={fetchShows}
          />
        ) : loading ? (
          // Skeletons for Theatres
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`theatre-skel-${i}`}
              className="bg-white rounded-md border border-border p-5 space-y-4 shadow-card"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-24 rounded-sm" />
                ))}
              </div>
            </div>
          ))
        ) : filteredTheatres.length > 0 ? (
          filteredTheatres.map(({ theatre, shows }) => (
            <div
              key={theatre.id}
              className="bg-white rounded-md border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow space-y-4"
            >
              {/* Theatre Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-ink">
                    {theatre.name}
                  </h3>
                  {theatre.address && (
                    <p className="text-xs text-muted mt-0.5 max-w-xl">
                      {theatre.address}
                    </p>
                  )}
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-gray-50 border border-border">
                    <Smartphone className="w-3 h-3 text-primary" />
                    <span>M-Ticket</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-gray-50 border border-border">
                    <Coffee className="w-3 h-3 text-amber-600" />
                    <span>F&B</span>
                  </span>
                </div>
              </div>

              {/* Show Time Pills Grid */}
              <div className="flex flex-wrap gap-3 pt-1">
                {shows.map((show) => (
                  <TimePill key={show.id} show={show} />
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <EmptyState
            icon={Calendar}
            title="No shows available for this date"
            hint={
              selectedLanguage !== 'all' || selectedPrice !== 'all' || selectedTime !== 'all'
                ? 'No shows match your current filters. Try resetting your filters.'
                : `There are currently no scheduled shows in ${selectedCity || 'your city'} for ${selectedDate}. Try selecting another date or switching your city.`
            }
            actionLabel={
              selectedLanguage !== 'all' || selectedPrice !== 'all' || selectedTime !== 'all'
                ? 'Reset Filters'
                : 'Change City'
            }
            onAction={
              selectedLanguage !== 'all' || selectedPrice !== 'all' || selectedTime !== 'all'
                ? handleResetFilters
                : () => dispatch(openCityModal())
            }
            className="bg-white rounded-md border border-border py-14 shadow-card"
          />
        )}
      </div>
    </div>
  );
};

export default Shows;
