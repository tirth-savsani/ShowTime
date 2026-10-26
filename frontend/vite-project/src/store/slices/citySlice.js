import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import moviesApi from '../../api/movies.api.js';

const STORAGE_KEY = 'showtime_city';

export const fetchCities = createAsyncThunk(
  'city/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const data = await moviesApi.getCities();
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Initial state reads persisted city from localStorage
const storedCity = localStorage.getItem(STORAGE_KEY) || null;

const initialState = {
  selected: storedCity,
  list: [],
  modalOpen: !storedCity, // Open automatically if no city chosen yet (Spec C3)
};

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    selectCity: (state, action) => {
      state.selected = action.payload;
      state.modalOpen = false;
      if (action.payload) {
        localStorage.setItem(STORAGE_KEY, action.payload);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    openCityModal: (state) => {
      state.modalOpen = true;
    },
    closeCityModal: (state) => {
      // Cannot close if no city is selected (Spec C3: blocking on first visit)
      if (state.selected) {
        state.modalOpen = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCities.fulfilled, (state, action) => {
      state.list = Array.isArray(action.payload) ? action.payload : [];
    });
  },
});

export const { selectCity, openCityModal, closeCityModal } = citySlice.actions;
export default citySlice.reducer;
