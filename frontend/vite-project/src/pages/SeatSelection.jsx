import React from 'react';
import { useParams } from 'react-router-dom';

export const SeatSelection = () => {
  const { showId } = useParams();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-2">Select Seats</h1>
      <p className="text-sm text-muted">Show ID: {showId}</p>
    </div>
  );
};

export default SeatSelection;
