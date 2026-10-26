/**
 * Report View (Spec B4, B6.11)
 * Serializes the stats payload for the admin dashboard.
 */

/**
 * Format the full stats response.
 * @param {{ totals, perDay, topMovies, upcomingOccupancy, activeShows }} stats
 */
export const serializeStats = (stats) => ({
  totals: {
    revenue: stats.totals.revenue,
    bookings: stats.totals.bookings,
    tickets: stats.totals.tickets,
  },
  activeShows: stats.activeShows,
  perDay: stats.perDay.map((d) => ({
    date: d.date,
    revenue: d.revenue,
    bookings: d.bookings,
    tickets: d.tickets,
  })),
  topMovies: stats.topMovies.map((m) => ({
    movieId: m.movieId,
    title: m.title,
    posterUrl: m.posterUrl ?? null,
    revenue: m.revenue,
    bookings: m.bookings,
    tickets: m.tickets,
  })),
  upcomingOccupancy: stats.upcomingOccupancy.map((s) => ({
    showId: s.showId,
    movieTitle: s.movieTitle,
    theatreName: s.theatreName,
    screenName: s.screenName,
    startTime: s.startTime,
    totalSeats: s.totalSeats,
    bookedSeats: s.bookedSeats,
    heldSeats: s.heldSeats,
    occupancyPct: s.occupancyPct,
  })),
});

export default { serializeStats };
