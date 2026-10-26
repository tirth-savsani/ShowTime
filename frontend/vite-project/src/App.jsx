import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './store/slices/authSlice.js';
import AppRoutes from './routes/AppRoutes.jsx';

export const App = () => {
  const dispatch = useDispatch();

  // Fetch current user on initial app boot (Spec C3)
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* Toast Notification Container (Spec C4: top-center, 4s, white card with 4px left border) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className:
            '!bg-white !text-ink !text-sm !shadow-modal !rounded-sm !p-3.5 !border !border-border',
          success: {
            className:
              '!border-l-4 !border-l-success !bg-white !text-ink !shadow-modal',
            iconTheme: {
              primary: '#1EA83C',
              secondary: '#FFFFFF',
            },
          },
          error: {
            className:
              '!border-l-4 !border-l-danger !bg-white !text-ink !shadow-modal',
            iconTheme: {
              primary: '#D32F2F',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
