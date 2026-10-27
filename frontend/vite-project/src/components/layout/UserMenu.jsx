import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Ticket, LogOut, ChevronDown } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice.js';

export const UserMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Generate initials from user name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  // Outside click & Escape listener (Spec C5)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
          {initials}
        </div>
        <span className="hidden sm:inline-block text-sm font-medium text-ink max-w-[120px] truncate">
          {user?.name?.split(' ')[0] || 'Account'}
        </span>
        <ChevronDown className="w-4 h-4 text-muted hidden sm:inline-block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-modal border border-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-2.5 border-b border-border bg-gray-50/50">
            <p className="text-xs text-muted uppercase font-semibold tracking-wider">
              Signed in as
            </p>
            <p className="text-sm font-bold text-ink truncate mt-0.5">
              {user?.name}
            </p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>

          <div className="py-1">
            <Link
              to="/my-bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-gray-50 hover:text-primary transition-colors"
            >
              <Ticket className="w-4 h-4 text-muted" />
              My Bookings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-red-50/40 transition-colors text-left cursor-pointer border-t border-border/50 mt-1"
            >
              <LogOut className="w-4 h-4 text-danger" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
