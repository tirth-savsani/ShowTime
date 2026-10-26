import React from 'react';
import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="bg-navy text-gray-300 pt-12 pb-8 mt-auto border-t border-navy-light text-sm">
      <div className="container mx-auto px-4 sm:px-6">
        {/* 4 Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-navy-light">
          {/* Column 1: About */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              ShowTime
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore/movies" className="hover:text-white transition-colors">Movies Now Showing</Link></li>
              <li><Link to="/explore/movies?tab=coming_soon" className="hover:text-white transition-colors">Upcoming Movies</Link></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Cinemas & Multiplexes</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">About Us</span></li>
            </ul>
          </div>

          {/* Column 2: Help & Support */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Help & Support
            </h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Contact Support</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Booking FAQ</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Cancellation Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>

          {/* Column 3: Top Cities */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Key Cities
            </h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Movies in Bengaluru</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Movies in Mumbai</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Movies in Delhi NCR</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Movies in Hyderabad</span></li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Connect With Us
            </h5>
            <p className="text-xs text-gray-400 mb-3">
              Experience seamless cinema ticketing across India.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">YouTube</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 text-center text-xs text-gray-400 space-y-2">
          <p>
            Disclaimer: ShowTime is a demonstration movie ticket booking web application. All transactions operate in test mode.
          </p>
          <p>
            © {currentYear} ShowTime Entertainment Pvt. Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
