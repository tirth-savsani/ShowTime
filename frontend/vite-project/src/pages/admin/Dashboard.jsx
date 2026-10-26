import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Ticket,
  Calendar,
  TrendingUp,
  Percent,
  Film,
  Building2,
  Tv,
  Loader2,
} from 'lucide-react';
import adminApi from '../../api/admin.api.js';
import { LineChart, BarChart } from '../../components/admin/Charts.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getStats(14);
      const data = res?.data || res;
      setStats(data);
    } catch (err) {
      setError(err?.message || 'Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted">Calculating real-time analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load analytics"
          message={error || 'Unable to retrieve dashboard metrics.'}
          onRetry={fetchStats}
        />
      </div>
    );
  }

  const totals = stats.totals || {};
  const perDay = stats.perDay || [];
  const topMovies = stats.topMovies || [];
  const upcomingOccupancy = stats.upcomingOccupancy || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-ink tracking-tight">
          Executive Dashboard
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Real-time overview of ticket revenue, scheduled screenings, and venue occupancies.
        </p>
      </div>

      {/* 1. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Total Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-black text-ink">
              ₹{(totals.revenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Razorpay Verified</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 2: Confirmed Bookings */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Confirmed Bookings
            </span>
            <p className="text-2xl sm:text-3xl font-black text-ink">
              {(totals.bookings || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-muted">
              {totals.tickets || 0} tickets sold
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Ticket className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 3: Active Shows */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Active Shows
            </span>
            <p className="text-2xl sm:text-3xl font-black text-ink">
              {(stats.activeShows || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-muted">
              Scheduled future screenings
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-navy/10 text-navy flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row (Pure SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bookings per Day (Line Chart) */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Daily Bookings Trend</h3>
              <p className="text-xs text-muted">Ticket activity over the past 14 days</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-muted px-2 py-0.5 rounded-xs bg-gray-100">
              14 Days
            </span>
          </div>
          <LineChart data={perDay} />
        </div>

        {/* Chart 2: Top Movies by Revenue (Bar Chart) */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Top 5 Movies by Revenue</h3>
              <p className="text-xs text-muted">Highest grossing films across all theatres</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-muted px-2 py-0.5 rounded-xs bg-gray-100">
              Top 5
            </span>
          </div>
          <BarChart data={topMovies} />
        </div>
      </div>

      {/* 3. Upcoming Shows Occupancy Table */}
      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink">Screen Occupancy Monitor</h3>
            <p className="text-xs text-muted">Seat utilization rates for upcoming shows</p>
          </div>
          <span className="text-xs font-semibold text-muted">
            {upcomingOccupancy.length} Active Shows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted font-bold uppercase tracking-wider text-[11px] bg-gray-50/50">
                <th className="py-2.5 px-3">Movie</th>
                <th className="py-2.5 px-3">Theatre & Screen</th>
                <th className="py-2.5 px-3">Start Time</th>
                <th className="py-2.5 px-3 text-center">Booked / Total</th>
                <th className="py-2.5 px-3">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {upcomingOccupancy.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No future scheduled shows to monitor.
                  </td>
                </tr>
              ) : (
                upcomingOccupancy.map((s, idx) => (
                  <tr key={s.showId || idx} className="hover:bg-gray-50/70">
                    <td className="py-2.5 px-3 font-bold text-ink max-w-[160px] truncate">
                      {s.movieTitle}
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {s.theatreName} • {s.screenName}
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {formatDateTime(s.startTime)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">
                      {s.bookedSeats} / {s.totalSeats}
                    </td>
                    <td className="py-2.5 px-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.occupancyPct >= 80
                                ? 'bg-danger'
                                : s.occupancyPct >= 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, s.occupancyPct || 0)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-ink w-8 text-right">
                          {s.occupancyPct || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
