/**
 * Movie Serializer View (Spec B1, B3, B4)
 */
export const serializeMovieCard = (movie) => {
  if (!movie) return null;
  const doc = movie.toObject ? movie.toObject() : movie;

  return {
    id: doc._id ? doc._id.toString() : doc.id,
    title: doc.title,
    description: doc.description,
    genres: doc.genres || [],
    languages: doc.languages || [],
    formats: doc.formats || [],
    durationMin: doc.durationMin,
    releaseDate: doc.releaseDate ? new Date(doc.releaseDate).toISOString() : null,
    certificate: doc.certificate,
    posterUrl: doc.posterUrl,
    backdropUrl: doc.backdropUrl || doc.posterUrl,
    status: doc.status,
    rating: doc.rating ?? null,
    votes: doc.votes ?? 0,
    director: doc.director || null,
  };
};

export const serializeMovieDetail = (movie) => {
  if (!movie) return null;
  const doc = movie.toObject ? movie.toObject() : movie;

  return {
    id: doc._id ? doc._id.toString() : doc.id,
    title: doc.title,
    description: doc.description,
    genres: doc.genres || [],
    languages: doc.languages || [],
    formats: doc.formats || [],
    durationMin: doc.durationMin,
    releaseDate: doc.releaseDate ? new Date(doc.releaseDate).toISOString() : null,
    certificate: doc.certificate,
    posterUrl: doc.posterUrl,
    backdropUrl: doc.backdropUrl || doc.posterUrl,
    trailerUrl: doc.trailerUrl || null,
    cast: doc.cast || [],
    status: doc.status,
    rating: doc.rating ?? null,
    votes: doc.votes ?? 0,
    director: doc.director || null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
};

export default {
  serializeMovieCard,
  serializeMovieDetail,
};
