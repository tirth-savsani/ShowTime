import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export const MoviePosterCard = ({ movie, className = '' }) => {
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

  return (
    <Link
      to={`/movies/${movieId}`}
      className={`group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md ${className}`}
      aria-label={`View movie ${title}`}
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-gray-100 shadow-card transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-card-hover">
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

        {/* Bottom Gradient Strip with Certificate & First Language */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-end px-2.5 pb-2 justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {certificate && (
              <span className="bg-black/60 text-white border border-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                {certificate}
              </span>
            )}
            {primaryLanguage && (
              <span className="text-white text-[11px] font-medium drop-shadow-sm truncate max-w-[100px]">
                {primaryLanguage}
              </span>
            )}
          </div>
          {movie.status === 'coming_soon' && (
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/20 border border-primary/40 px-1 rounded-xs">
              Soon
            </span>
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
        <p className="text-sm text-muted truncate" title={genres}>
          {genres || 'Cinema'}
        </p>
      </div>
    </Link>
  );
};

export default MoviePosterCard;
