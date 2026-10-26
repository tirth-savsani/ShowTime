import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Film, Sparkles } from 'lucide-react';
import moviesApi from '../api/movies.api.js';
import { openCityModal } from '../store/slices/citySlice.js';
import HeroCarousel from '../components/movie/HeroCarousel.jsx';
import MovieRow from '../components/movie/MovieRow.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

export const Home = () => {
  const dispatch = useDispatch();
  const { selected: selectedCity } = useSelector((state) => state.city);

  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch featured movies (for hero carousel)
      // 2. Fetch now showing movies (filtered by selected city)
      // 3. Fetch coming soon movies
      const [featuredRes, recommendedRes, comingSoonRes] = await Promise.all([
        moviesApi.getFeaturedMovies({ city: selectedCity || undefined }).catch(() => ({ items: [] })),
        moviesApi.getMovies({
          status: 'now_showing',
          city: selectedCity || undefined,
          limit: 10,
        }),
        moviesApi.getMovies({
          status: 'coming_soon',
          limit: 10,
        }),
      ]);

      const featuredList = Array.isArray(featuredRes)
        ? featuredRes
        : featuredRes?.items || [];
      const recommendedList = Array.isArray(recommendedRes)
        ? recommendedRes
        : recommendedRes?.items || [];
      const comingSoonList = Array.isArray(comingSoonRes)
        ? comingSoonRes
        : comingSoonRes?.items || [];

      // If featured is empty, fallback to first few recommended movies with backdrops/posters
      setFeaturedMovies(
        featuredList.length > 0 ? featuredList : recommendedList.slice(0, 5)
      );
      setRecommendedMovies(recommendedList);
      setComingSoonMovies(comingSoonList);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load movies. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* 1. Hero Carousel */}
      <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <HeroCarousel movies={featuredMovies} loading={loading} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 space-y-10">
        {/* Error Handling with Retry */}
        {error ? (
          <ErrorState
            title="Unable to load movies"
            message={error}
            onRetry={fetchHomeData}
          />
        ) : (
          <>
            {/* 2. Recommended Movies Section */}
            {loading ? (
              <MovieRow
                title="Recommended Movies"
                subtitle={selectedCity ? `In ${selectedCity}` : 'In Theatres Now'}
                seeAllLink="/explore/movies?tab=now_showing"
                loading={true}
              />
            ) : recommendedMovies.length > 0 ? (
              <MovieRow
                title="Recommended Movies"
                subtitle={selectedCity ? `Playing in ${selectedCity}` : 'In Theatres Now'}
                seeAllLink="/explore/movies?tab=now_showing"
                movies={recommendedMovies}
              />
            ) : (
              /* Empty state if no movies are playing in the selected city */
              <EmptyState
                icon={MapPin}
                title={`No movies playing in ${selectedCity || 'this city'} right now`}
                hint="Check back soon or switch your city to browse current showtimes and theatres."
                actionLabel="Change City"
                onAction={() => dispatch(openCityModal())}
                className="bg-white rounded-lg border border-border py-12"
              />
            )}

            {/* 3. Coming Soon Row */}
            <MovieRow
              title="Coming Soon"
              subtitle="Exciting upcoming releases to add to your watchlist"
              seeAllLink="/explore/movies?tab=coming_soon"
              movies={comingSoonMovies}
              loading={loading}
            />
          </>
        )}

        {/* Feature Highlights Banner */}
        <div className="pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-md shadow-card border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                01
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink mb-1">Atomic 5-Min Seat Hold</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Real-time distributed seat locking ensures zero double-booking while you complete checkout.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-md shadow-card border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                02
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink mb-1">Razorpay Verified Payments</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Cryptographic HMAC signature verification with instant e-tickets and QR access.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-md shadow-card border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                03
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink mb-1">Multi-City Cinema Discovery</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Find theatres, IMAX 3D, 4DX, and real-time seating availability across India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
