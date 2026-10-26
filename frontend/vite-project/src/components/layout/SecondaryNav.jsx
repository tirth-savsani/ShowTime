import React from 'react';
import { NavLink } from 'react-router-dom';

export const SecondaryNav = () => {
  const leftLinks = [
    { name: 'Movies', to: '/explore/movies' },
    { name: 'Stream', to: '/explore/movies?genre=Action' },
    { name: 'Events', to: '/explore/movies' },
    { name: 'Plays', to: '/explore/movies' },
    { name: 'Sports', to: '/explore/movies' },
    { name: 'Activities', to: '/explore/movies' },
  ];

  const rightLinks = [
    { name: 'ListYourShow', to: '#' },
    { name: 'Corporates', to: '#' },
    { name: 'Offers', to: '#' },
    { name: 'Gift Cards', to: '#' },
  ];

  return (
    <nav className="bg-navy h-10 w-full overflow-x-auto no-scrollbar select-none">
      <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between text-[13px] text-white">
        {/* Left Categories */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {leftLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `hover:underline transition-all whitespace-nowrap ${
                  isActive && item.name === 'Movies'
                    ? 'font-bold text-white underline'
                    : 'text-gray-200'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right Utility Links (hidden on smaller screens) */}
        <div className="hidden lg:flex items-center gap-5 text-gray-300 text-xs">
          {rightLinks.map((link) => (
            <span
              key={link.name}
              className="hover:text-white cursor-pointer transition-colors"
            >
              {link.name}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNav;
