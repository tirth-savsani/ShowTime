import api from './axios.js';

export const showsApi = {
  getShowsByMovie: (movieId, params = {}) =>
    api.get(`/api/movies/${movieId}/shows`, { params }),
  getSeatsForShow: (showId) =>
    api.get(`/api/shows/${showId}/seats`),
  holdSeats: (showId, seatIds) =>
    api.post(`/api/shows/${showId}/hold`, { seatIds }),
  releaseHold: (showId) =>
    api.delete(`/api/shows/${showId}/hold`),
};

export default showsApi;
