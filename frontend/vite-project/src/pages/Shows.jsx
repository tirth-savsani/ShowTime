import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const Shows = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-2">Showtimes</h1>
      <p className="text-sm text-muted">Movie ID: {id} | Date: {date || 'Today'}</p>
    </div>
  );
};

export default Shows;
