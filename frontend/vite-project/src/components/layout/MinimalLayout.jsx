import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AuthModal from './AuthModal.jsx';
import ScrollToTop from '../common/ScrollToTop.jsx';

export const MinimalLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg text-ink">
      <ScrollToTop />
      {/* Minimal Top Brand Bar */}
      <header className="h-14 bg-white border-b border-border flex items-center px-4 sm:px-6 sticky top-0 z-40">
        <Link
          to="/"
          className="flex items-center gap-1.5 focus:outline-none"
          aria-label="ShowTime Home"
        >
          <span className="text-xl font-black tracking-tight text-primary uppercase select-none">
            Show<span className="text-ink">Time</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <AuthModal />
    </div>
  );
};

export default MinimalLayout;
