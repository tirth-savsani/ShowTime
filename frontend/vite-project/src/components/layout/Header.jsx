import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import UserMenu from './UserMenu.jsx';
import Button from '../common/Button.jsx';
import { openCityModal } from '../../store/slices/citySlice.js';
import { openAuthModal } from '../../store/slices/authSlice.js';

export const Header = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const { selected: selectedCity } = useSelector((state) => state.city);

  const isAuthenticated = status === 'authenticated' && user;

  const leftSubNav = [
    { label: 'Movies', to: '/explore/movies', active: true },
    { label: 'Stream', to: '/explore/movies?category=stream' },
    { label: 'Events', to: '/explore/movies?category=events' },
    { label: 'Plays', to: '/explore/movies?category=plays' },
    { label: 'Sports', to: '/explore/movies?category=sports' },
    { label: 'Activities', to: '/explore/movies?category=activities' },
  ];

  const rightSubNav = [
    { label: 'Buzz', to: '/explore/movies' },
    { label: 'Corporate', to: '/explore/movies' },
    { label: 'Offers', to: '/explore/movies' },
    { label: 'Gift Cards', to: '/explore/movies' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
      {/* Primary Main Bar */}
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & SearchBar */}
        <div className="flex items-center gap-6 flex-1 max-w-[720px]">
          {/* ShowTime Wordmark Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 focus:outline-none"
            aria-label="ShowTime Home"
          >
            <span className="text-2xl font-black tracking-tight text-primary uppercase select-none">
              Show<span className="text-ink">Time</span>
            </span>
          </Link>

          {/* SearchBar - Hidden on mobile, visible on tablet & desktop */}
          <div className="hidden md:block flex-1">
            <SearchBar />
          </div>
        </div>

        {/* Right: City Selector & User Menu / Sign In */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* City Selector Button */}
          <button
            type="button"
            onClick={() => dispatch(openCityModal())}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink hover:text-primary transition-colors py-1.5 px-2.5 rounded-xs hover:bg-gray-50 focus:outline-none cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="max-w-[110px] truncate font-medium">
              {selectedCity || 'Select City'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>

          {/* User Section */}
          {isAuthenticated ? (
            <UserMenu user={user} />
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => dispatch(openAuthModal('login'))}
              className="text-xs font-semibold px-4 shadow-xs"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Second Row: SearchBar */}
      <div className="md:hidden px-4 pb-2.5">
        <SearchBar className="max-w-none" />
      </div>

      {/* Secondary Sub-Navigation Bar (BookMyShow style) */}
      <nav
        className="hidden md:block bg-gray-50/90 border-t border-border/60 text-xs font-medium text-ink"
        aria-label="Sub navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
          {/* Left Navigation Categories */}
          <div className="flex items-center gap-6">
            {leftSubNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`py-2 transition-colors relative hover:text-primary ${
                  item.active
                    ? 'text-primary font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Ancillary Links */}
          <div className="flex items-center gap-5 text-[11px] text-muted">
            {rightSubNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
