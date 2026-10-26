import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import cityReducer from './slices/citySlice.js';
import bookingReducer from './slices/bookingSlice.js';
import { injectStore } from '../api/axios.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    city: cityReducer,
    booking: bookingReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Inject store reference to Axios interceptor for 401 handling
injectStore(store);

export default store;
