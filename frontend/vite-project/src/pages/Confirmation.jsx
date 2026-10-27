import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  Home,
  QrCode,
  Loader2,
  Ticket as TicketIcon,
  Film,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import bookingsApi from '../api/bookings.api.js';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

export const Confirmation = () => {
  const { id: bookingId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    bookingsApi
      .getBookingById(bookingId)
      .then((res) => {
        if (isMounted) {
          const data = res?.data || res;
          setTicket(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to retrieve booking confirmation.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await bookingsApi.cancelBooking(bookingId);
      const updated = res?.data || res;
      toast.success('Booking cancelled. 100% refund initiated to your account.');
      setTicket((prev) => ({
        ...prev,
        ...updated,
        status: 'CANCELLED',
      }));
      setCancelModalOpen(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted">Retrieving your confirmed ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 flex justify-center">
        <ErrorState
          title="Booking Not Found"
          message={error || 'We could not locate this booking confirmation.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const snapshot = ticket.snapshot || {};
  const seatsList = (ticket.seats || []).map((s) => s.seatId || s).join(', ');
  const qrImage = ticket.qrDataUrl || ticket.qrCode;
  const paymentId = ticket.razorpay?.paymentId || ticket.payment?.paymentId;

  // Case-insensitive status checks
  const statusUpper = String(ticket.status || '').toUpperCase();
  const isConfirmed = statusUpper === 'CONFIRMED';
  const isCancelled = statusUpper === 'CANCELLED';

  // 24-hour cancellation window check
  const showTime = new Date(snapshot.startTime).getTime();
  const isWithinCutoff = showTime - Date.now() <= 24 * 60 * 60 * 1000;
  const canCancel = isConfirmed && !isWithinCutoff;

  return (
    <>
      {/* Print Stylesheet: Isolates #printable-ticket only (Spec C6) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible !important;
          }
          #printable-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-10 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl space-y-8">
          {/* 1. Header Banner */}
          <div className="flex flex-col items-center text-center space-y-3">
            {isCancelled ? (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 text-danger flex items-center justify-center shadow-xs">
                  <XCircle className="w-9 h-9 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                    Booking Cancelled
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-1 max-w-md">
                    100% refund of ₹{ticket.amount} has been initiated to your original payment method.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                    Booking Confirmed!
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-1 max-w-md">
                    Your tickets are locked and ready. A confirmation has been stored in your account history.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Cancellation Policy Banner */}
          {isConfirmed && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {canCancel
                    ? 'Free cancellation available up to 24 hours before showtime (100% instant refund).'
                    : 'Cancellation window closed (showtime is within 24 hours).'}
                </span>
              </div>
            </div>
          )}

          {/* 2. Authentic Ticket Card with Perforated Tear-Line */}
          <div
            id="printable-ticket"
            className="bg-white rounded-xl border border-border shadow-card overflow-hidden"
          >
            {/* Ticket Header Ribbon */}
            <div className="bg-navy px-6 py-4 text-white flex items-center justify-between">
              <span className="text-lg font-black tracking-tight text-primary uppercase">
                Show<span className="text-white">Time</span> Cinemas
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">Booking ID:</span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xs bg-white/20 text-white tracking-wider">
                  {ticket.bookingRef}
                </span>
              </div>
            </div>

            {/* Ticket Upper Body: Poster, Movie & Theatre Details */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
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

                {/* Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                      {snapshot.movieTitle}
                    </h2>
                    {snapshot.certificate && (
                      <span className="px-1.5 py-0.2 rounded-xs border border-border text-[10px] font-bold text-muted uppercase">
                        {snapshot.certificate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-primary">
                    {snapshot.format || '2D'} • {snapshot.language || 'Hindi'}
                  </p>

                  {/* Theatre & Showtime Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-muted">Theatre & Audi:</span>
                      <p className="font-bold text-ink truncate">
                        {snapshot.theatreName}
                      </p>
                      <p className="text-muted truncate">{snapshot.theatreAddress}</p>
                      <p className="font-semibold text-gray-700">{snapshot.screenName}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="font-semibold text-muted">Showtime:</span>
                      <p className="font-bold text-ink">
                        {formatDateTime(snapshot.startTime)}
                      </p>
                      <div className="pt-1">
                        <span className="font-semibold text-muted">Seats: </span>
                        <span className="font-mono font-bold text-sm text-primary">
                          {seatsList}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashed Tear Line with Circular Punch Notches */}
            <div className="relative border-b-2 border-dashed border-gray-300 my-1">
              <div className="absolute -left-3.5 -top-3 w-6 h-6 rounded-full bg-gray-50 border border-border" />
              <div className="absolute -right-3.5 -top-3 w-6 h-6 rounded-full bg-gray-50 border border-border" />
            </div>

            {/* Ticket Lower Body: QR Code & Payment Verification */}
            <div className="p-6 sm:p-8 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* QR Code */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                {qrImage && !isCancelled ? (
                  <div className="w-32 h-32 p-1.5 bg-white border border-border rounded-md shadow-xs flex items-center justify-center">
                    <img
                      src={qrImage}
                      alt="Ticket Verification QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-md flex flex-col items-center justify-center text-muted">
                    <QrCode className="w-12 h-12 opacity-30" />
                    {isCancelled && <span className="text-[10px] font-bold text-danger mt-1">VOID</span>}
                  </div>
                )}
                <span className="text-[10px] text-muted font-medium pt-1">
                  {isCancelled ? 'Ticket has been cancelled and voided' : 'Scan at theatre gate for seamless entry'}
                </span>
              </div>

              {/* Financial & Reference Summary */}
              <div className="space-y-1.5 text-center sm:text-right text-xs">
                <div>
                  <span className="text-muted">Total Amount Paid</span>
                  <p className="text-2xl font-black text-ink">
                    ₹{ticket.amount}
                  </p>
                </div>
                {paymentId && (
                  <div>
                    <span className="text-muted">Payment ID:</span>
                    <p className="font-mono text-gray-700">
                      {paymentId}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted">Status:</span>
                  <span
                    className={`ml-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCancelled
                        ? 'bg-red-100 text-danger'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {!isCancelled && (
              <Button
                variant="primary"
                size="lg"
                onClick={handlePrint}
                className="gap-2 font-bold px-6 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </Button>
            )}

            {/* Cancel Booking Button - Visibly accessible directly on ticket page */}
            {isConfirmed && (
              <Button
                variant={canCancel ? 'danger' : 'outline'}
                size="lg"
                onClick={() => setCancelModalOpen(true)}
                disabled={!canCancel}
                className={`gap-2 font-bold px-6 shadow-md ${
                  canCancel
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'text-gray-400 border-gray-300 cursor-not-allowed opacity-75'
                }`}
                title={
                  !canCancel
                    ? 'Cancellations only allowed up to 24 hours before showtime.'
                    : 'Cancel this booking and receive a full 100% refund'
                }
              >
                <XCircle className="w-4 h-4" />
                <span>{canCancel ? 'Cancel Booking' : 'Non-Refundable (< 24h)'}</span>
              </Button>
            )}

            <Link to="/my-bookings">
              <Button variant="secondary" size="lg" className="gap-2">
                <TicketIcon className="w-4 h-4" />
                <span>My Bookings</span>
              </Button>
            </Link>

            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2">
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Booking?"
        maxWidth="max-w-md"
      >
        <div className="py-2 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-800 space-y-1">
            <p className="font-bold">Refund Policy Notice:</p>
            <p>
              100% of <span className="font-bold">₹{ticket.amount}</span> will be refunded to your original payment method within 5-7 working days via Razorpay. Cancellations are permitted up to 24 hours before showtime.
            </p>
          </div>

          <div className="text-xs space-y-1 text-ink">
            <p>
              <span className="text-muted">Movie: </span>
              <span className="font-bold">{snapshot.movieTitle}</span>
            </p>
            <p>
              <span className="text-muted">Booking Reference: </span>
              <span className="font-mono font-bold">{ticket.bookingRef}</span>
            </p>
            <p>
              <span className="text-muted">Showtime: </span>
              <span>{formatDateTime(snapshot.startTime)}</span>
            </p>
            <p>
              <span className="text-muted">Seats: </span>
              <span className="font-mono font-bold text-primary">{seatsList}</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              className="flex-1 font-bold bg-red-600 hover:bg-red-700 text-white"
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
      </Modal>
    </>
  );
};

export default Confirmation;
