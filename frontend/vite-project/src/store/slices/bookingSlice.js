import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'showtime_booking';

// Helper to safely read from sessionStorage
const loadSessionBooking = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const savedState = loadSessionBooking();

const initialState = {
  showId: savedState?.showId || null,
  seatCount: savedState?.seatCount || null, // 1..6
  selectedSeatIds: savedState?.selectedSeatIds || [],
  hold: savedState?.hold || null, // { seatIds, expiresAt, amount }
  bookingId: savedState?.bookingId || null,
};

const syncSession = (state) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        showId: state.showId,
        seatCount: state.seatCount,
        selectedSeatIds: state.selectedSeatIds,
        hold: state.hold,
        bookingId: state.bookingId,
      })
    );
  } catch (err) {
    console.error('Failed to sync booking state to sessionStorage:', err);
  }
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setShowId: (state, action) => {
      state.showId = action.payload;
      syncSession(state);
    },
    setSeatCount: (state, action) => {
      state.seatCount = action.payload;
      // If reducing seat count, slice selectedSeatIds accordingly
      if (state.selectedSeatIds.length > action.payload) {
        state.selectedSeatIds = state.selectedSeatIds.slice(0, action.payload);
      }
      syncSession(state);
    },
    toggleSeatSelection: (state, action) => {
      const seatId = action.payload;
      if (state.selectedSeatIds.includes(seatId)) {
        state.selectedSeatIds = state.selectedSeatIds.filter((id) => id !== seatId);
      } else {
        const max = state.seatCount || 6;
        if (state.selectedSeatIds.length < max) {
          state.selectedSeatIds.push(seatId);
        }
      }
      syncSession(state);
    },
    setSelectedSeatIds: (state, action) => {
      state.selectedSeatIds = action.payload;
      syncSession(state);
    },
    setHold: (state, action) => {
      state.hold = action.payload;
      if (action.payload?.seatIds) {
        state.selectedSeatIds = action.payload.seatIds;
      }
      syncSession(state);
    },
    setBookingId: (state, action) => {
      state.bookingId = action.payload;
      syncSession(state);
    },
    clearBookingFlow: (state) => {
      state.showId = null;
      state.seatCount = null;
      state.selectedSeatIds = [];
      state.hold = null;
      state.bookingId = null;
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Failed to clear sessionStorage booking:', err);
      }
    },
  },
});

export const {
  setShowId,
  setSeatCount,
  toggleSeatSelection,
  setSelectedSeatIds,
  setHold,
  setBookingId,
  clearBookingFlow,
} = bookingSlice.actions;

export default bookingSlice.reducer;
