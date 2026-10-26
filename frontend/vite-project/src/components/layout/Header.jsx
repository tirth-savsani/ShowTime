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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
      {/* Desktop & Main Bar */}
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
            <span className="max-w-[100px] truncate">
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
              className="text-xs font-semibold px-4"
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
    </header>
  );
};

export default Header;
