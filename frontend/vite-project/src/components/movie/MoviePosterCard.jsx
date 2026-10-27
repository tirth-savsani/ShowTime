import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Star } from 'lucide-react';

export const MoviePosterCard = ({ movie, rank = null, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const movieId = movie._id || movie.id;
  const title = movie.title || 'Untitled';
  const certificate = movie.certificate || 'UA';
  const languages = Array.isArray(movie.languages)
    ? movie.languages
    : movie.languages?.split(',') || [];
  const primaryLanguage = languages[0] || '';
  const genres = Array.isArray(movie.genres)
    ? movie.genres.join(', ')
    : movie.genres || '';

  // Format vote count e.g. 124500 -> "124.5K"
  const formatVotes = (count) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Format release date e.g. "2026-11-14" -> "14 Nov, 2026"
  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isComingSoon = movie.status === 'coming_soon';
  const releaseDateFormatted = formatReleaseDate(movie.releaseDate);

  return (
    <Link
      to={`/movies/${movieId}`}
      className={`group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg ${className}`}
      aria-label={`View movie ${title}`}
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 shadow-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-card-hover">
        {!imageError && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400 p-4 text-center">
            <Film className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-medium text-gray-500 line-clamp-2">
              {title}
            </span>
          </div>
        )}

        {/* Trending Rank Numeral (BookMyShow Top 10 style) */}
        {rank !== null && (
          <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-black/80 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center text-xs font-black shadow-md">
            #{rank}
          </div>
        )}

        {/* Signature BookMyShow Rating Strip at Bottom of Poster */}
        <div className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-xs px-2.5 py-1.5 text-white flex items-center justify-between text-xs z-10">
          {isComingSoon ? (
            <span className="text-[11px] font-bold text-primary-light truncate">
              {releaseDateFormatted ? `Releasing ${releaseDateFormatted}` : 'Coming Soon'}
            </span>
          ) : movie.rating ? (
            <>
              <div className="flex items-center gap-1 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs">{Number(movie.rating).toFixed(1)}/10</span>
              </div>
              {movie.votes && (
                <span className="text-[10px] text-gray-300 font-medium">
                  {formatVotes(movie.votes)} Votes
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
              <span className="font-semibold uppercase">{certificate}</span>
              {primaryLanguage && <span>• {primaryLanguage}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Metadata Below Poster */}
      <div className="mt-2.5 space-y-0.5">
        <h3
          className="text-base font-bold text-ink truncate group-hover:text-primary transition-colors"
          title={title}
        >
          {title}
        </h3>
        <p className="text-xs text-muted truncate" title={genres}>
          {genres || 'Cinema'}
        </p>
      </div>
    </Link>
  );
};

export default MoviePosterCard;
