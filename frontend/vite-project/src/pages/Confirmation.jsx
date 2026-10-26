import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  Home,
  QrCode,
  Loader2,
  Ticket as TicketIcon,
} from 'lucide-react';
import bookingsApi from '../api/bookings.api.js';
import Button from '../components/common/Button.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

export const Confirmation = () => {
  const { id: bookingId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          {/* 1. Celebratory Success Banner */}
          <div className="flex flex-col items-center text-center space-y-3">
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
          </div>

          {/* 2. Authentic Ticket Card with Tear-Line */}
          <div
            id="printable-ticket"
            className="bg-white rounded-xl border border-border shadow-card overflow-hidden"
          >
            {/* Ticket Header Ribbon */}
            <div className="bg-navy px-6 py-4 text-white flex items-center justify-between">
              <span className="text-lg font-black tracking-tight text-primary uppercase">
                Show<span className="text-white">Time</span> Cinemas
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-white/20 text-white tracking-wider">
                {ticket.bookingRef}
              </span>
            </div>

            {/* Ticket Upper Body: Movie & Theatre */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-ink">
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
                </div>
              </div>

              {/* Theatre & Showtime Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-muted">Theatre & Audi:</span>
                  <p className="font-bold text-ink">
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

            {/* Dashed Tear Line with Circular Punch Notches */}
            <div className="relative border-b-2 border-dashed border-gray-300 my-1">
              <div className="absolute -left-3.5 -top-3 w-6 h-6 rounded-full bg-gray-50 border border-border" />
              <div className="absolute -right-3.5 -top-3 w-6 h-6 rounded-full bg-gray-50 border border-border" />
            </div>

            {/* Ticket Lower Body: QR Code & Verification */}
            <div className="p-6 sm:p-8 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* QR Code */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                {ticket.qrCode ? (
                  <div className="w-32 h-32 p-1.5 bg-white border border-border rounded-md shadow-xs flex items-center justify-center">
                    <img
                      src={ticket.qrCode}
                      alt="Ticket Verification QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-muted opacity-40" />
                  </div>
                )}
                <span className="text-[10px] text-muted font-medium pt-1">
                  Scan at theatre gate for seamless entry
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
                {ticket.payment?.paymentId && (
                  <div>
                    <span className="text-muted">Payment ID:</span>
                    <p className="font-mono text-gray-700">
                      {ticket.payment.paymentId}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted">Status:</span>
                  <span className="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePrint}
              className="gap-2 font-bold px-6 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket</span>
            </Button>

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
    </>
  );
};

export default Confirmation;
