import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Clock,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Film,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import bookingsApi from '../api/bookings.api.js';
import showsApi from '../api/shows.api.js';
import { clearBookingFlow, setBookingId } from '../store/slices/bookingSlice.js';
import loadRazorpayScript from '../utils/loadRazorpay.js';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';

export const Checkout = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const bookingState = useSelector((state) => state.booking);
  const { hold, selectedSeatIds } = bookingState;

  // Local states
  const [showDetails, setShowDetails] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 min default
  const [isTestHelpOpen, setIsTestHelpOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Network verification retry state
  const [pendingVerificationPayload, setPendingVerificationPayload] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    toast.success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Fetch show details for the summary card
  useEffect(() => {
    let isMounted = true;
    showsApi
      .getSeatsForShow(showId)
      .then((res) => {
        if (isMounted) {
          const data = res?.data || res;
          setShowDetails(data?.show || null);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [showId]);

  // Countdown timer driven by hold expiry
  useEffect(() => {
    const expiresAt = hold?.expiresAt
      ? new Date(hold.expiresAt).getTime()
      : Date.now() + 5 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hold]);

  // Prevent accidental tab close during payment
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPaying || isVerifying) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPaying, isVerifying]);

  // Format mm:ss
  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format show time
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

  // Poll server for confirmed status in case verification or webhook is processing
  const pollBookingConfirmation = async (targetBookingId, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const res = await bookingsApi.getBookingById(targetBookingId);
        const booking = res?.data || res;
        if (booking && (booking.status === 'CONFIRMED' || booking.id)) {
          dispatch(clearBookingFlow());
          navigate(`/booking/${booking.id || targetBookingId}/confirmation`, { replace: true });
          return true;
        }
      } catch {
        // continue polling
      }
    }
    return false;
  };

  // Retry payment verification in case of network interruption
  const handleRetryVerification = async () => {
    if (!pendingVerificationPayload) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const verifyRes = await bookingsApi.verifyPayment(pendingVerificationPayload);
      const confirmedTicket = verifyRes?.data || verifyRes;
      dispatch(clearBookingFlow());
      navigate(`/booking/${confirmedTicket.id}/confirmation`, { replace: true });
    } catch (err) {
      const resolved = await pollBookingConfirmation(pendingVerificationPayload.bookingId, 5);
      if (!resolved) {
        setVerificationError(
          err?.message || 'Verification could not reach the server. Please check your network and try again.'
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Main Razorpay checkout flow
  const handleProceedToPayment = async () => {
    if (isExpired) {
      toast.error('Seat hold expired. Please select seats again.');
      return;
    }

    setIsPaying(true);

    try {
      // 1. Create Checkout & Razorpay Order on server
      const checkoutRes = await bookingsApi.checkout(showId);
      const data = checkoutRes?.data || checkoutRes;

      const { booking, razorpay } = data;
      dispatch(setBookingId(booking.id));

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your connection.');
      }

      // 3. Launch Razorpay modal
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amountPaise,
        currency: razorpay.currency || 'INR',
        name: 'ShowTime Cinemas',
        description: `Movie Tickets for ${showDetails?.movie?.title || 'Cinema'}`,
        order_id: razorpay.orderId,
        handler: async function (response) {
          const payload = {
            bookingId: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          setIsVerifying(true);
          try {
            const verifyRes = await bookingsApi.verifyPayment(payload);
            const confirmedTicket = verifyRes?.data || verifyRes;
            dispatch(clearBookingFlow());
            // Replace history so Back button does not return to checkout
            navigate(`/booking/${confirmedTicket.id}/confirmation`, { replace: true });
          } catch (verifyErr) {
            // First attempt to poll for confirmation (e.g. if webhook / async capture caught it)
            const resolved = await pollBookingConfirmation(booking.id, 5);
            if (!resolved) {
              setPendingVerificationPayload(payload);
              setVerificationError(
                verifyErr?.message || 'Verification is taking longer than expected. Please retry below.'
              );
            }
          } finally {
            setIsVerifying(false);
            setIsPaying(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#E63946',
        },
        modal: {
          ondismiss: async function () {
            setIsPaying(false);
            try {
              await bookingsApi.markFailed(booking.id, 'Payment dismissed by user');
            } catch {}
            toast.error('Payment was cancelled. You can try again.');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      setIsPaying(false);
      toast.error(err?.message || 'Failed to start payment. Please try again.');
    }
  };

  const movie = showDetails?.movie;
  const theatre = showDetails?.theatre;
  const totalAmount = hold?.amount || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Countdown Banner Header */}
      <div
        className={`sticky top-0 z-40 px-4 py-3 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors ${
          remainingSeconds <= 60
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-navy text-white'
        }`}
      >
        <Clock className="w-4 h-4 text-primary" />
        <span>
          Complete your payment in{' '}
          <span className="font-mono text-base font-black tracking-wider text-primary-light">
            {formatTimer(remainingSeconds)}
          </span>
        </span>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-3xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link
            to={`/shows/${showId}/seats`}
            onClick={() => {
              showsApi.releaseHold(showId).catch(() => {});
              dispatch(clearBookingFlow());
            }}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to seat map</span>
          </Link>
        </div>

        {/* Test Payment Helper Accordion */}
        <div className="bg-white rounded-lg border border-blue-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsTestHelpOpen(!isTestHelpOpen)}
            className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">
                Test Payment Help (Razorpay Sandbox Mode)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-wider uppercase">
                TEST
              </span>
            </div>
            {isTestHelpOpen ? (
              <ChevronUp className="w-4 h-4 text-blue-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-700" />
            )}
          </button>

          {isTestHelpOpen && (
            <div className="p-4 text-xs space-y-3 bg-white text-gray-700 border-t border-blue-100">
              <p className="text-[11px] text-gray-500">
                ShowTime is running in Razorpay Test Mode. Real money will not be deducted. Click any item to copy:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Cards */}
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-1.5">
                  <span className="font-bold text-ink block text-[11px] uppercase tracking-wider text-muted">
                    Test Cards
                  </span>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-gray-200 font-mono text-[11px]">
                    <div>
                      <span className="text-gray-500 mr-1">Visa:</span>
                      <span className="font-bold">4111 1111 1111 1111</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('4111111111111111')}
                      className="text-gray-400 hover:text-blue-600"
                      title="Copy Visa Number"
                    >
                      {copiedText === '4111111111111111' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-gray-200 font-mono text-[11px]">
                    <div>
                      <span className="text-gray-500 mr-1">Mastercard:</span>
                      <span className="font-bold">5123 4567 8901 2345</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('5123456789012345')}
                      className="text-gray-400 hover:text-blue-600"
                      title="Copy Mastercard Number"
                    >
                      {copiedText === '5123456789012345' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Expiry: Any future date (e.g. 12/28) • CVV: 123
                  </p>
                </div>

                {/* UPI & Netbanking */}
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-1.5">
                  <span className="font-bold text-ink block text-[11px] uppercase tracking-wider text-muted">
                    UPI & OTP
                  </span>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-gray-200 font-mono text-[11px]">
                    <div>
                      <span className="text-gray-500 mr-1">Success UPI:</span>
                      <span className="font-bold text-emerald-600">success@razorpay</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('success@razorpay')}
                      className="text-gray-400 hover:text-blue-600"
                      title="Copy UPI ID"
                    >
                      {copiedText === 'success@razorpay' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200 text-[10px] text-gray-600 space-y-1">
                    <p>
                      • <strong>OTP:</strong> Enter any 4-6 digits (e.g. 123456)
                    </p>
                    <p>
                      • <strong>Netbanking:</strong> Select any test bank (HDFC, SBI, ICICI)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Retry Banner (In case of network timeout) */}
        {pendingVerificationPayload && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 space-y-3 shadow-card">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Payment Captured — Confirming Booking
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Your payment was recorded successfully by Razorpay! We are finalizing your ticket with the cinema server. Please do NOT pay again.
                </p>
                {verificationError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {verificationError}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRetryVerification}
              disabled={isVerifying}
              className="gap-2 font-bold"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Ticket...</span>
                </>
              ) : (
                <span>Confirm & View Ticket</span>
              )}
            </Button>
          </div>
        )}

        {/* 2. Booking Summary Card */}
        <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row gap-5 items-start">
            {/* Poster Thumbnail */}
            <div className="w-20 sm:w-24 aspect-[2/3] rounded-md overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-border">
              {movie?.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <Film className="w-6 h-6 opacity-40" />
                </div>
              )}
            </div>

            {/* Movie & Show Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-ink truncate">
                  {movie?.title || 'Movie'}
                </h2>
                {movie?.certificate && (
                  <span className="px-1.5 py-0.2 rounded-xs border border-border text-[10px] font-bold text-muted uppercase">
                    {movie.certificate}
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-primary">
                {showDetails?.format || '2D'} • {showDetails?.language || 'Hindi'}
              </p>

              <div className="text-xs text-muted space-y-0.5 pt-1">
                <p className="font-semibold text-ink">{theatre?.name}</p>
                <p>{theatre?.address}</p>
                <p className="text-gray-700 font-medium pt-0.5">
                  {formatDateTime(showDetails?.startTime)} • {showDetails?.screen?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Seat Breakdown & Live Pricing */}
          <div className="p-5 sm:p-6 bg-gray-50/60 space-y-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
              Booking Breakdown
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-ink">
                <span>
                  Seats ({selectedSeatIds?.length || 0} Tickets):
                </span>
                <span className="font-bold font-mono">
                  {selectedSeatIds?.join(', ') || 'None selected'}
                </span>
              </div>

              <div className="border-t border-border pt-3 flex items-baseline justify-between text-base">
                <span className="font-bold text-ink">Total Amount:</span>
                <span className="text-xl sm:text-2xl font-black text-primary">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment CTA Action */}
        <div className="bg-white rounded-lg border border-border p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-bit encrypted checkout powered by Razorpay</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleProceedToPayment}
            disabled={isPaying || isVerifying || isExpired}
            className="w-full font-black text-base py-4 shadow-lg shadow-primary/30"
          >
            {isPaying ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Payment Gateway...</span>
              </div>
            ) : isVerifying ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Payment...</span>
              </div>
            ) : (
              <span>Pay ₹{totalAmount}</span>
            )}
          </Button>
        </div>
      </div>

      {/* 4. Session Expired Modal */}
      <Modal
        isOpen={isExpired}
        onClose={() => {
          dispatch(clearBookingFlow());
          navigate(`/shows/${showId}/seats`);
        }}
        title="Session Expired"
        maxWidth="max-w-md"
        blocking={true}
        showCloseButton={false}
      >
        <div className="py-2 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-100 text-danger flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-ink mb-1">
              Your 5-Minute Hold Expired
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              To keep cinema bookings fair for everyone, uncompleted seat holds are automatically released after 5 minutes.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full font-bold"
            onClick={() => {
              dispatch(clearBookingFlow());
              navigate(`/shows/${showId}/seats`);
            }}
          >
            Choose Seats Again
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
