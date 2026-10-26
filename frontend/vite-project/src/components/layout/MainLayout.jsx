import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import SecondaryNav from './SecondaryNav.jsx';
import Footer from './Footer.jsx';
import CityModal from './CityModal.jsx';
import AuthModal from './AuthModal.jsx';
import ScrollToTop from '../common/ScrollToTop.jsx';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg text-ink">
      <ScrollToTop />
      <Header />
      <SecondaryNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CityModal />
      <AuthModal />
    </div>
  );
};

export default MainLayout;
