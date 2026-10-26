import React from 'react';
import { useParams } from 'react-router-dom';

export const MovieDetail = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-2">Movie Details</h1>
      <p className="text-sm text-muted">Movie ID: {id}</p>
    </div>
  );
};

export default MovieDetail;
