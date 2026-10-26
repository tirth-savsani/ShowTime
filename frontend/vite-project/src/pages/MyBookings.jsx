import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
  Ban,
  Film,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import bookingsApi from '../api/bookings.api.js';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

export const MyBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = searchParams.get('tab') || 'upcoming';

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const handleTabChange = (newTab) => {
    if (newTab === tab) return;
    setSearchParams({ tab: newTab });
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingsApi.getMyBookings({ tab, page: 1, limit: 10 });
      const data = response?.data || response;
      const items = Array.isArray(data) ? data : data?.items || [];
      const pag = data?.pagination || { page: 1, limit: 10, total: items.length, pages: 1 };

      setBookings(items);
      setPagination(pag);
    } catch (err) {
      setError(err?.message || 'Failed to fetch bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Cancellation confirmation
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);

    try {
      await bookingsApi.cancelBooking(cancelModalBooking.id);
      toast.success('Booking cancelled. 100% refund initiated to your account.');
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  // Format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-6">
        {/* Page Title & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              My Bookings
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Manage your cinema tickets, view barcodes, and request refunds.
            </p>
          </div>

          {/* Tab Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-md self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTabChange('upcoming')}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                tab === 'upcoming'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('past')}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                tab === 'past'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Past
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('cancelled')}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                tab === 'cancelled'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <ErrorState
            title="Unable to load bookings"
            message={error}
            onRetry={fetchBookings}
          />
        ) : loading ? (
          // Skeleton Cards
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`skel-booking-${idx}`}
                className="bg-white rounded-lg border border-border p-5 space-y-4 shadow-card"
              >
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-24 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          // List of Bookings
          <div className="space-y-4">
            {bookings.map((b) => {
              const snapshot = b.snapshot || {};
              const seatsList = (b.seats || []).map((s) => s.seatId || s).join(', ');

              // 2-hour cancellation cutoff check (Spec B6.6, C6)
              const showTime = new Date(snapshot.startTime).getTime();
              const isConfirmed = b.status === 'confirmed';
              const isCancelled = b.status === 'cancelled';
              const isWithinCutoff = showTime - Date.now() <= 2 * 60 * 60 * 1000;
              const canCancel = isConfirmed && !isWithinCutoff;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-lg border border-border shadow-card hover:shadow-card-hover transition-shadow overflow-hidden"
                >
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
                    {/* Poster Thumbnail */}
                    <div className="w-20 sm:w-24 aspect-[2/3] rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-border shadow-xs">
                      {snapshot.posterUrl ? (
                        <img
                          src={snapshot.posterUrl}
                          alt={snapshot.movieTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Film className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-ink truncate">
                            {snapshot.movieTitle}
                          </h3>
                          {snapshot.certificate && (
                            <span className="px-1.5 py-0.2 rounded-xs border border-border text-[10px] font-bold text-muted uppercase">
                              {snapshot.certificate}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCancelled
                              ? 'bg-red-100 text-danger'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-primary">
                        {snapshot.format || '2D'} • {snapshot.language || 'Hindi'}
                      </p>

                      <div className="text-xs text-muted space-y-0.5 pt-0.5">
                        <p className="font-semibold text-ink">{snapshot.theatreName}</p>
                        <p className="text-gray-700 font-medium">
                          {formatDateTime(snapshot.startTime)} • {snapshot.screenName}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Seats: </span>
                          <span className="font-mono font-bold text-primary">
                            {seatsList}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                        <div>
                          <span className="text-muted">Ref: </span>
                          <span className="font-mono font-bold text-ink">
                            {b.bookingRef}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted">Amount: </span>
                          <span className="font-bold text-ink">₹{b.amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="bg-gray-50 px-5 sm:px-6 py-3 border-t border-border flex items-center justify-between gap-3">
                    {/* View Ticket Link */}
                    {isConfirmed && (
                      <Link to={`/booking/${b.id}/confirmation`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Ticket className="w-3.5 h-3.5 text-primary" />
                          <span>View Ticket</span>
                        </Button>
                      </Link>
                    )}

                    {/* Cancel Booking Action */}
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancelModalBooking(b)}
                        disabled={!canCancel}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                          canCancel
                            ? 'text-danger hover:bg-red-50'
                            : 'text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                        title={
                          !canCancel
                            ? 'Cancellations only allowed up to 2 hours before showtime.'
                            : 'Cancel booking and initiate refund'
                        }
                      >
                        Cancel Booking
                      </button>
                    )}

                    {isCancelled && b.cancelReason && (
                      <span className="text-xs text-muted">
                        Reason: {b.cancelReason}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <EmptyState
            icon={Ticket}
            title={
              tab === 'upcoming'
                ? 'No upcoming bookings'
                : tab === 'past'
                ? 'No past bookings'
                : 'No cancelled bookings'
            }
            hint={
              tab === 'upcoming'
                ? 'Ready for movie night? Explore now showing blockbusters in your city.'
                : 'Your completed bookings will show up here.'
            }
            actionLabel={tab === 'upcoming' ? 'Explore Movies' : undefined}
            onAction={tab === 'upcoming' ? () => navigate('/explore/movies') : undefined}
            className="bg-white rounded-lg border border-border py-14 shadow-card"
          />
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        title="Cancel Booking?"
        maxWidth="max-w-md"
      >
        {cancelModalBooking && (
          <div className="py-2 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-800 space-y-1">
              <p className="font-bold">Refund Policy Notice:</p>
              <p>
                100% of <span className="font-bold">₹{cancelModalBooking.amount}</span> will be refunded to your original payment method within 5-7 working days via Razorpay.
              </p>
            </div>

            <div className="text-xs space-y-1 text-ink">
              <p>
                <span className="text-muted">Movie: </span>
                <span className="font-bold">{cancelModalBooking.snapshot?.movieTitle}</span>
              </p>
              <p>
                <span className="text-muted">Booking Reference: </span>
                <span className="font-mono font-bold">{cancelModalBooking.bookingRef}</span>
              </p>
              <p>
                <span className="text-muted">Showtime: </span>
                <span>{formatDateTime(cancelModalBooking.snapshot?.startTime)}</span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                className="flex-1 font-bold"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <div className="flex items-center gap-1.5 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;
