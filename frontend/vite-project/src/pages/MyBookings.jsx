import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'upcoming';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-2">My Bookings</h1>
      <p className="text-sm text-muted">Viewing {tab} bookings</p>
    </div>
  );
};

export default MyBookings;
