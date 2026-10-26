import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Calendar,
  Clock,
  Film,
  ExternalLink,
  Ticket,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import moviesApi from '../api/movies.api.js';
import Button from '../components/common/Button.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import TrailerModal, { getYoutubeEmbedUrl } from '../components/movie/TrailerModal.jsx';

export const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage('');

    moviesApi
      .getMovieById(id)
      .then((data) => {
        if (isMounted) {
          setMovie(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorStatus(err.status || 500);
          setErrorMessage(err.message || 'Failed to load movie details.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Duration formatting (e.g. 148 -> "2h 28m")
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  // Date formatting (e.g. 2026-11-15 -> "15 Nov, 2026")
  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleTrailerClick = () => {
    if (!movie?.trailerUrl) return;
    const isYoutube = Boolean(getYoutubeEmbedUrl(movie.trailerUrl));
    if (isYoutube) {
      setIsTrailerOpen(true);
    } else {
      window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-10 pb-16">
        {/* Hero Skeleton */}
        <div className="relative bg-navy py-12 sm:py-16 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start">
            <div className="w-[180px] sm:w-[220px] md:w-[260px] aspect-[2/3] rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 w-full space-y-4 pt-2">
              <Skeleton className="h-10 w-3/4 bg-gray-700" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 bg-gray-700" />
                <Skeleton className="h-6 w-16 bg-gray-700" />
                <Skeleton className="h-6 w-20 bg-gray-700" />
              </div>
              <Skeleton className="h-5 w-1/2 bg-gray-700" />
              <div className="pt-4 flex gap-4">
                <Skeleton className="h-12 w-40 bg-gray-700 rounded-md" />
                <Skeleton className="h-12 w-36 bg-gray-700 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 space-y-8 max-w-4xl">
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-14 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (errorStatus === 404 || !movie) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-50 text-danger flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Movie Not Found</h1>
        <p className="text-sm text-muted mb-6">
          The movie you are looking for does not exist, has been archived, or the link is invalid.
        </p>
        <Link to="/explore/movies">
          <Button variant="primary">Browse Movies</Button>
        </Link>
      </div>
    );
  }

  // 3. General Error State
  if (errorStatus) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-50 text-danger flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">Error Loading Movie</h1>
        <p className="text-sm text-muted mb-6">{errorMessage}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const isNowShowing = movie.status === 'now_showing';
  const isComingSoon = movie.status === 'coming_soon';
  const isArchived = movie.status === 'archived';
  const backdropImg = movie.backdropUrl || movie.posterUrl;
  const isYoutubeTrailer = Boolean(getYoutubeEmbedUrl(movie.trailerUrl));

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Hero Section with Blurred Backdrop & Dark Overlay */}
      <section className="relative bg-navy overflow-hidden">
        {/* Backdrop Image Container with Blur */}
        {backdropImg && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={backdropImg}
              alt=""
              className="w-full h-full object-cover object-center filter blur-lg scale-110 opacity-30 transform -translate-y-4"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Multi-stop dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/75 pointer-events-none" />

        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 py-10 sm:py-14 md:py-16">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start text-white">
            {/* Left: Rounded Poster */}
            <div className="w-[180px] sm:w-[220px] md:w-[260px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-gray-900 flex-shrink-0">
              {!posterError && movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={() => setPosterError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
                  <Film className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs">{movie.title}</span>
                </div>
              )}
            </div>

            {/* Right: Movie Metadata & Actions */}
            <div className="flex-1 text-center sm:text-left space-y-4">
              {/* Coming Soon / Status Notification Banner */}
              {isComingSoon && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Releasing on {formatReleaseDate(movie.releaseDate)}
                  </span>
                </div>
              )}
              {isArchived && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 text-xs font-medium">
                  <span>Archived / Theatrical Run Completed</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {movie.title}
              </h1>

              {/* Format & Language Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {/* Formats */}
                {movie.formats?.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-0.5 rounded-xs bg-primary font-bold text-xs uppercase tracking-wider"
                  >
                    {fmt}
                  </span>
                ))}
                {/* Languages */}
                {movie.languages?.map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-0.5 rounded-xs bg-white/15 text-gray-200 font-semibold text-xs border border-white/10"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* Duration, Genres, Certificate, Release Date */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-300 pt-1">
                {movie.durationMin && (
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatDuration(movie.durationMin)}
                  </span>
                )}
                {movie.genres?.length > 0 && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span>{movie.genres.join(', ')}</span>
                  </>
                )}
                {movie.certificate && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-black/50 border border-white/20 text-[11px] font-bold">
                      {movie.certificate}
                    </span>
                  </>
                )}
                {movie.releaseDate && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span>{formatReleaseDate(movie.releaseDate)}</span>
                  </>
                )}
              </div>

              {/* Action Buttons: Trailer & Book Tickets */}
              <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                {/* Book Tickets CTA Button */}
                {isNowShowing ? (
                  <Link to={`/movies/${movie.id}/shows`}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="gap-2 font-bold px-8 shadow-lg shadow-primary/30 text-base"
                    >
                      <Ticket className="w-5 h-5" />
                      Book Tickets
                    </Button>
                  </Link>
                ) : isComingSoon ? (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={true}
                    className="gap-2 font-semibold px-6 opacity-60 cursor-not-allowed"
                    title={`Booking opens near release date (${formatReleaseDate(movie.releaseDate)})`}
                  >
                    <Calendar className="w-5 h-5" />
                    Booking Opens Soon
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={true}
                    className="gap-2 font-semibold px-6 opacity-60 cursor-not-allowed"
                  >
                    Showings Ended
                  </Button>
                )}

                {/* Trailer Button */}
                {movie.trailerUrl && (
                  <button
                    type="button"
                    onClick={handleTrailerClick}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-white/30 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-xs transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>Watch Trailer</span>
                    {!isYoutubeTrailer && (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 ml-0.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container: About & Cast */}
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl space-y-10">
        {/* About the Movie */}
        {movie.description && (
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              About the movie
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl whitespace-pre-line">
              {movie.description}
            </p>
          </section>
        )}

        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <section className="space-y-4 pt-2 border-t border-border">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Cast
            </h2>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 pt-1">
              {movie.cast.map((member, idx) => (
                <div
                  key={`${member.name}-${idx}`}
                  className="flex flex-col items-center text-center flex-shrink-0 w-24 sm:w-28 space-y-2 group"
                >
                  {/* Circular Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 shadow-sm border border-border flex items-center justify-center transition-transform group-hover:scale-105">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 ${
                        member.imageUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      <User className="w-8 h-8 opacity-60" />
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-0.5 w-full">
                    <p
                      className="text-xs sm:text-sm font-bold text-ink truncate"
                      title={member.name}
                    >
                      {member.name}
                    </p>
                    <p
                      className="text-[11px] sm:text-xs text-muted truncate"
                      title={member.role || 'Actor'}
                    >
                      {member.role || 'Actor'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {isYoutubeTrailer && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={movie.trailerUrl}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
};

export default MovieDetail;
