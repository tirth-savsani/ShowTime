import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  Search,
  Eye,
  Ban,
  Clock,
  QrCode,
  User,
  AlertCircle,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../api/admin.api.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail drawer modal state
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancel booking modal state
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      if (emailFilter.trim()) params.email = emailFilter.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminApi.getBookings(params);
      const data = res?.data || res;
      setBookings(data?.items || []);
      setPagination(data?.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, emailFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await adminApi.cancelBooking(cancelModalBooking._id || cancelModalBooking.id);
      toast.success('Booking cancelled and refund issued via Razorpay.');
      setCancelModalBooking(null);
      fetchBookings(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

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

  const columns = [
    {
      key: 'bookingRef',
      label: 'Ref & Date',
      render: (b) => (
        <div>
          <span className="font-mono font-bold text-ink block">{b.bookingRef}</span>
          <span className="text-[10px] text-muted">{formatDateTime(b.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Customer',
      render: (b) => (
        <div>
          <span className="font-semibold text-ink block">
            {b.user?.name || 'Customer'}
          </span>
          <span className="text-[10px] text-muted">{b.user?.email}</span>
        </div>
      ),
    },
    {
      key: 'movie',
      label: 'Screening',
      render: (b) => {
        const snap = b.snapshot || {};
        return (
          <div>
            <span className="font-bold text-ink block truncate max-w-[160px]">
              {snap.movieTitle}
            </span>
            <span className="text-[10px] text-muted truncate max-w-[160px] block">
              {snap.theatreName} • {snap.screenName}
            </span>
          </div>
        );
      },
    },
    {
      key: 'seats',
      label: 'Seats & Amount',
      render: (b) => {
        const seatsList = (b.seats || []).map((s) => s.seatId || s).join(', ');
        return (
          <div>
            <span className="font-bold text-ink block">₹{b.amount}</span>
            <span className="text-[10px] font-mono text-primary truncate max-w-[100px] block">
              {seatsList}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            b.status === 'confirmed'
              ? 'bg-emerald-100 text-emerald-700'
              : b.status === 'cancelled'
              ? 'bg-red-100 text-danger'
              : b.status === 'pending'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedBooking(b)}
            className="p-1.5 rounded-sm hover:bg-gray-100 text-ink hover:text-primary transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {b.status === 'confirmed' && (
            <button
              type="button"
              onClick={() => setCancelModalBooking(b)}
              className="p-1.5 rounded-sm hover:bg-red-50 text-muted hover:text-danger transition-colors cursor-pointer"
              title="Admin Cancel Booking"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ink tracking-tight">Customer Bookings</h1>
        <p className="text-xs text-muted mt-0.5">
          Search orders, inspect cryptographic Razorpay signatures, and execute administrative refunds.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-border shadow-card flex flex-wrap items-center gap-3">
        {/* Email Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="pl-8 pr-2.5 py-1.5 bg-gray-50 border border-border rounded-xs text-xs text-ink focus:outline-none focus:border-primary w-48 sm:w-60"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-border rounded-xs px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-50 border border-border rounded-xs px-2 py-1 text-xs text-ink focus:outline-none focus:border-primary"
          />
          <span>To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-gray-50 border border-border rounded-xs px-2 py-1 text-xs text-ink focus:outline-none focus:border-primary"
          />
        </div>

        {(statusFilter || emailFilter || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('');
              setEmailFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs font-semibold text-primary hover:text-primary-dark ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMessage="No customer bookings found."
        pagination={{
          page: pagination.page,
          pages: pagination.pages,
          onPageChange: (newPage) => fetchBookings(newPage),
        }}
      />

      {/* Booking Details Drawer / Modal */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Booking Inspection Drawer"
        maxWidth="max-w-lg"
      >
        {selectedBooking && (
          <div className="space-y-4 py-2 text-xs">
            {/* Header Summary */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-muted block">Booking Reference</span>
                <span className="font-mono font-bold text-base text-ink">
                  {selectedBooking.bookingRef}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  selectedBooking.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : selectedBooking.status === 'cancelled'
                    ? 'bg-red-100 text-danger'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {selectedBooking.status}
              </span>
            </div>

            {/* Customer Details */}
            <div className="p-3 bg-gray-50 border border-border rounded-md space-y-1">
              <span className="font-bold text-ink block">Customer Info</span>
              <p>Name: {selectedBooking.user?.name || 'N/A'}</p>
              <p>Email: {selectedBooking.user?.email || 'N/A'}</p>
              <p>Phone: {selectedBooking.user?.phone || 'N/A'}</p>
            </div>

            {/* Screening Snapshot */}
            <div className="p-3 bg-gray-50 border border-border rounded-md space-y-1">
              <span className="font-bold text-ink block">Screening Snapshot</span>
              <p>Movie: {selectedBooking.snapshot?.movieTitle}</p>
              <p>Venue: {selectedBooking.snapshot?.theatreName} ({selectedBooking.snapshot?.screenName})</p>
              <p>Showtime: {formatDateTime(selectedBooking.snapshot?.startTime)}</p>
              <p>Format & Audio: {selectedBooking.snapshot?.format} • {selectedBooking.snapshot?.language}</p>
            </div>

            {/* Seats & Pricing */}
            <div className="p-3 bg-gray-50 border border-border rounded-md space-y-1">
              <span className="font-bold text-ink block">Seats & Financials</span>
              <p>Seats: {(selectedBooking.seats || []).map((s) => s.seatId || s).join(', ')}</p>
              <p className="text-sm font-bold text-ink pt-1">Total Paid: ₹{selectedBooking.amount}</p>
              {selectedBooking.razorpay?.paymentId && (
                <p className="font-mono text-[10px] text-muted">
                  Razorpay Payment ID: {selectedBooking.razorpay.paymentId}
                </p>
              )}
            </div>

            {/* Refund Info if Cancelled */}
            {selectedBooking.status === 'cancelled' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md space-y-1 text-danger font-semibold">
                <p>Cancelled at: {formatDateTime(selectedBooking.cancelledAt)}</p>
                <p>Reason: {selectedBooking.cancelReason || 'Admin Action'}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Admin Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        title="Admin Cancel Booking?"
        maxWidth="max-w-md"
      >
        {cancelModalBooking && (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-danger font-semibold space-y-1">
              <p>Caution: Administrative Action</p>
              <p className="font-normal text-red-900">
                Cancelling this booking will permanently release all booked seats and automatically trigger a Razorpay refund for ₹{cancelModalBooking.amount}.
              </p>
            </div>

            <p className="text-xs text-ink">
              Booking Ref: <span className="font-mono font-bold">{cancelModalBooking.bookingRef}</span> ({cancelModalBooking.user?.email})
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Refunding...' : 'Confirm & Refund'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bookings;
