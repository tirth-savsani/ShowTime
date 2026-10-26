import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Film, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export const Home = () => {
  const { selected: selectedCity } = useSelector((state) => state.city);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-r from-navy via-navy-light to-navy text-white py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ShowTime Cinema Experience</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mb-4">
            Movie Magic in <span className="text-primary">{selectedCity || 'Your City'}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-lg mb-8">
            Explore the latest blockbusters, choose your preferred seats with atomic locking, and book seamlessly with Razorpay.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/explore/movies">
              <Button variant="primary" size="lg" className="gap-2">
                <Film className="w-4 h-4" />
                Explore Movies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-md shadow-card border border-border">
            <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
              01
            </div>
            <h3 className="text-base font-bold text-ink mb-1">Atomic 5-Min Seat Hold</h3>
            <p className="text-xs text-muted leading-relaxed">
              No double booking. Real-time distributed seat locking ensures your chosen seats are strictly reserved while checking out.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-card border border-border">
            <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
              02
            </div>
            <h3 className="text-base font-bold text-ink mb-1">Razorpay Verified Payments</h3>
            <p className="text-xs text-muted leading-relaxed">
              Cryptographic server-side HMAC signature verification protects your payments with instant e-tickets and QR codes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-card border border-border">
            <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
              03
            </div>
            <h3 className="text-base font-bold text-ink mb-1">Live Multi-City Schedules</h3>
            <p className="text-xs text-muted leading-relaxed">
              Seamlessly browse theatres, screen layouts, audio formats (IMAX, 4DX, Dolby), and accurate pricing across India.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
