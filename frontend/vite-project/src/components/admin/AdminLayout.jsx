import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Film,
  Building2,
  Tv,
  Calendar,
  Ticket,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice.js';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Movies', path: '/admin/movies', icon: Film },
  { label: 'Theatres', path: '/admin/theatres', icon: Building2 },
  { label: 'Screens', path: '/admin/screens', icon: Tv },
  { label: 'Shows', path: '/admin/shows', icon: Calendar },
  { label: 'Bookings', path: '/admin/bookings', icon: Ticket },
  { label: 'Users', path: '/admin/users', icon: Users },
];

export const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-navy-light flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-primary uppercase">
              Show<span className="text-white">Time</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-primary/20 text-primary border border-primary/30">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-300 hover:bg-navy-light hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer with Exit Link */}
      <div className="p-4 border-t border-navy-light space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-md hover:bg-navy-light transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Exit to Public Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* 1. Desktop Navy Sidebar (260px) */}
      <aside className="hidden md:flex w-64 bg-navy text-white flex-col flex-shrink-0 min-h-screen sticky top-0 h-screen border-r border-navy-light z-30">
        {navContent}
      </aside>

      {/* 2. Mobile Sliding Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-navy text-white z-10 flex flex-col h-full shadow-2xl">
            {navContent}
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-border shadow-xs h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-ink p-1 rounded-sm hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-ink hidden sm:block">
              ShowTime Control Center
            </h2>
          </div>

          {/* Right: Admin Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-xs text-left">
                <p className="font-bold text-ink truncate max-w-[150px]">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-muted text-[10px] truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-danger p-1.5 rounded-sm hover:bg-red-50 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
