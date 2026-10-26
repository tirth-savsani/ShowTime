import React from 'react';
import { useParams } from 'react-router-dom';

export const Confirmation = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 text-center">
      <h1 className="text-2xl font-bold text-ink mb-2">Booking Confirmation</h1>
      <p className="text-sm text-muted">Booking Reference: {id}</p>
    </div>
  );
};

export default Confirmation;
