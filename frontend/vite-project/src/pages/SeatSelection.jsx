import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeft,
  Pencil,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import showsApi from '../api/shows.api.js';
import {
  setSeatCount,
  setSelectedSeatIds,
  setHold,
  setShowId,
} from '../store/slices/bookingSlice.js';
import SeatCountModal from '../components/seat/SeatCountModal.jsx';
import SeatItem from '../components/seat/SeatItem.jsx';
import ScreenGraphic from '../components/seat/ScreenGraphic.jsx';
import Button from '../components/common/Button.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

const EMPTY_SEAT_IDS = [];

export const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const bookingState = useSelector((state) => state.booking);
  const seatCount = bookingState.seatCount || 2;
  const selectedSeatIds = bookingState.selectedSeatIds || EMPTY_SEAT_IDS;

  // Local state
  const [seatMapData, setSeatMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState(null);
  const [isCountModalOpen, setIsCountModalOpen] = useState(!bookingState.seatCount);

  const selectedSeatIdsRef = useRef(selectedSeatIds);
  useEffect(() => {
    selectedSeatIdsRef.current = selectedSeatIds;
  }, [selectedSeatIds]);

  // Sync Redux showId
  useEffect(() => {
    dispatch(setShowId(showId));
    if (!bookingState.seatCount) {
      dispatch(setSeatCount(2));
    }
  }, [showId, dispatch, bookingState.seatCount]);

  // Fetch seat map
  const fetchSeatMap = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);

    try {
      const response = await showsApi.getSeatsForShow(showId);
      const data = response?.data || response;
      setSeatMapData(data);
      setError(null);

      // If polling: verify that none of current selections were booked by someone else
      if (isPolling && data?.seats) {
        const bookedSeatIds = new Set(
          data.seats
            .filter((s) => s.status === 'BOOKED' || s.status === 'HELD')
            .map((s) => s.id)
        );

        const currentSelected = selectedSeatIdsRef.current;
        const conflicting = currentSelected.filter((sid) => bookedSeatIds.has(sid));

        if (conflicting.length > 0) {
          toast.error(`Seats ${conflicting.join(', ')} were just taken by another user.`);
          const remaining = currentSelected.filter((sid) => !bookedSeatIds.has(sid));
          dispatch(setSelectedSeatIds(remaining));
        }
      }
    } catch (err) {
      if (!isPolling) {
        setError(err?.message || 'Failed to load seat layout.');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [showId, dispatch]);

  // Initial load
  useEffect(() => {
    fetchSeatMap(false);
  }, [fetchSeatMap]);

  // 10-second polling with visibility detection (Spec C6)
  useEffect(() => {
    let pollInterval = null;

    const startPolling = () => {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(() => {
        if (!document.hidden) {
          fetchSeatMap(true);
        }
      }, 10000);
    };

    const stopPolling = () => {
      if (pollInterval) clearInterval(pollInterval);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Tab became visible: fetch immediately and restart interval
        fetchSeatMap(true);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSeatMap]);

  // Fast seat lookup map
  const seatLookup = useMemo(() => {
    const map = new Map();
    if (seatMapData?.seats) {
      seatMapData.seats.forEach((s) => map.set(s.id, s));
    }
    return map;
  }, [seatMapData]);

  // Calculate live price total
  const liveTotal = useMemo(() => {
    let sum = 0;
    selectedSeatIds.forEach((sid) => {
      const s = seatLookup.get(sid);
      if (s) sum += s.price || 0;
    });
    return sum;
  }, [selectedSeatIds, seatLookup]);

  // Handle seat count change from modal
  const handleSelectCount = (count) => {
    dispatch(setSeatCount(count));
    if (selectedSeatIds.length > count) {
      dispatch(setSelectedSeatIds(selectedSeatIds.slice(0, count)));
    }
    setIsCountModalOpen(false);
  };

  // Toggle seat selection
  const handleToggleSeat = (seatId) => {
    const isAlreadySelected = selectedSeatIds.includes(seatId);

    if (isAlreadySelected) {
      dispatch(setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seatId)));
    } else {
      if (selectedSeatIds.length >= seatCount) {
        toast.error(`You have already selected ${seatCount} seat${seatCount > 1 ? 's' : ''}. Deselect one to choose a different seat.`);
        return;
      }
      dispatch(setSelectedSeatIds([...selectedSeatIds, seatId]));
    }
  };

  // Submit atomic hold and proceed to checkout
  const handleProceedToHold = async () => {
    if (selectedSeatIds.length === 0) return;

    if (selectedSeatIds.length < seatCount) {
      toast.error(`Please select all ${seatCount} seats before proceeding.`);
      return;
    }

    setHolding(true);
    try {
      const response = await showsApi.holdSeats(showId, selectedSeatIds);
      const holdData = response?.data || response;

      // Store hold in Redux and navigate to checkout
      dispatch(setHold(holdData));
      navigate(`/checkout/${showId}`);
    } catch (err) {
      // 409 Conflict: Seats were taken
      if (err.status === 409 || err.code === 'SEATS_UNAVAILABLE') {
        const unavailable =
          err.details?.unavailableSeatIds ||
          err.data?.details?.unavailableSeatIds ||
          [];

        const message = unavailable.length > 0
          ? `Seat(s) ${unavailable.join(', ')} are no longer available. Please choose another seat.`
          : 'Selected seats were just taken by another user. Please choose different seats.';

        toast.error(message);

        // Deselect unavailable seats and refresh map
        const remaining = selectedSeatIds.filter((id) => !unavailable.includes(id));
        dispatch(setSelectedSeatIds(remaining));
        fetchSeatMap(true);
      } else {
        toast.error(err.message || 'Failed to hold seats. Please try again.');
      }
    } finally {
      setHolding(false);
    }
  };

  // Formatter for show time
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return isoString;
    }
  };

  const show = seatMapData?.show;
  const categories = seatMapData?.categories || [];
  const movie = show?.movie;
  const theatre = show?.theatre;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted">Loading Cinema Screen Layout...</p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState
          title="Could not load seat map"
          message={error || 'Show information is unavailable.'}
          onRetry={() => fetchSeatMap(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between pb-28">
      {/* 1. Minimal Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs px-4 sm:px-6 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Left: Back Arrow + Movie Details */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/movies/${movie?.id}/shows`)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-ink transition-colors cursor-pointer"
              aria-label="Back to showtimes"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-ink truncate max-w-[200px] sm:max-w-md">
                  {movie?.title}
                </h1>
                {movie?.certificate && (
                  <span className="px-1.5 py-0.2 rounded-xs border border-border text-[10px] font-bold text-muted uppercase">
                    {movie.certificate}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted truncate max-w-[250px] sm:max-w-lg">
                {theatre?.name} • {show.screen?.name} • {formatDateTime(show.startTime)}
              </p>
            </div>
          </div>

          {/* Right: "N Tickets" Edit Count Button */}
          <button
            type="button"
            onClick={() => setIsCountModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-colors cursor-pointer"
            aria-label={`Change ticket count: currently ${seatCount} tickets`}
          >
            <span>{seatCount} {seatCount === 1 ? 'Ticket' : 'Tickets'}</span>
            <Pencil className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </header>

      {/* 2. Interactive Seat Map Area with Horizontal Touch Scrolling */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 overflow-x-auto select-none">
        <div className="min-w-fit mx-auto flex flex-col items-center">
          {/* Render Each Category Section */}
          <div className="space-y-8 w-full">
            {categories.map((category) => (
              <div key={category.name} className="space-y-3">
                {/* Category Header with Price & Divider */}
                <div className="flex items-center gap-4 text-xs font-bold text-muted uppercase tracking-wider">
                  <span>Rs. {category.price} {category.name}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Rows Grid */}
                <div className="space-y-2">
                  {category.rows?.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      {/* Row Label Left */}
                      <span className="w-6 text-xs font-bold text-muted select-none text-center">
                        {row.label}
                      </span>

                      {/* Seats in Row */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {row.seats?.map((seat) => (
                          <SeatItem
                            key={seat.id}
                            seat={seat}
                            categoryName={category.name}
                            price={category.price}
                            isSelected={selectedSeatIds.includes(seat.id)}
                            onToggle={handleToggleSeat}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Curved Cinema Screen Graphic & Status Legend */}
          <ScreenGraphic />
        </div>
      </main>

      {/* 3. Sticky Bottom Red "Pay Rs. X" Bar */}
      {selectedSeatIds.length > 0 && (
        <aside
          className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-2xl p-4 animate-in slide-in-from-bottom duration-200"
          aria-label="Booking Action Bar"
        >
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl">
            {/* Left: Summary of Selected Seats */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold text-muted">Selected Seats:</span>
                <span className="text-sm font-bold text-ink">
                  {selectedSeatIds.join(', ')}
                </span>
                <span className="text-xs text-muted">
                  ({selectedSeatIds.length}/{seatCount})
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Atomic 5-minute lock commences upon proceeding to payment.
              </p>
            </div>

            {/* Right: "Pay Rs. X" CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToHold}
              disabled={holding || selectedSeatIds.length < seatCount}
              className="w-full sm:w-auto font-black px-8 py-3.5 shadow-lg shadow-primary/30 min-w-[200px]"
            >
              {holding ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Holding Seats...</span>
                </div>
              ) : (
                <span>Pay Rs. {liveTotal}</span>
              )}
            </Button>
          </div>
        </aside>
      )}

      {/* "How many seats?" Modal */}
      <SeatCountModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        currentCount={seatCount}
        onSelectCount={handleSelectCount}
      />
    </div>
  );
};

export default SeatSelection;
