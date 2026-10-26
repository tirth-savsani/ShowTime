/**
 * Formats a Show document for client presentation (Spec B1, B4)
 */
export const formatShow = (show) => {
  if (!show) return null;
  const showObj = typeof show.toObject === 'function' ? show.toObject() : { ...show };

  const id = showObj.id || showObj._id?.toString();
  const pricing =
    showObj.pricing instanceof Map
      ? Object.fromEntries(showObj.pricing)
      : showObj.pricing || {};

  return {
    id,
    movie: showObj.movie,
    screen: showObj.screen,
    theatre: showObj.theatre,
    city: showObj.city,
    startTime: showObj.startTime,
    endTime: showObj.endTime,
    language: showObj.language,
    format: showObj.format,
    pricing,
    status: showObj.status,
    bookedCount: showObj.bookedCount,
    capacity: showObj.capacity,
    createdAt: showObj.createdAt,
    updatedAt: showObj.updatedAt,
  };
};

export const formatShowList = ({ items, pagination }) => {
  return {
    items: items.map(formatShow),
    pagination,
  };
};

export const formatPublicMovieShows = (data) => {
  return data;
};

export default {
  formatShow,
  formatShowList,
  formatPublicMovieShows,
};
