import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const Explore = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const tab = searchParams.get('tab') || 'now_showing';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-2">Explore Movies</h1>
      <p className="text-sm text-muted">
        Showing results for {tab === 'coming_soon' ? 'Coming Soon' : 'Now Showing'} {q ? `matching "${q}"` : ''}
      </p>
    </div>
  );
};

export default Explore;
