import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_200', label: 'Under ₹200' },
  { id: '200_350', label: '₹200 - ₹350' },
  { id: 'above_350', label: 'Above ₹350' },
];

const TIME_RANGES = [
  { id: 'all', label: 'All Showtimes' },
  { id: 'morning', label: 'Morning (Before 12 PM)' },
  { id: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
  { id: 'evening', label: 'Evening (4 PM - 7 PM)' },
  { id: 'night', label: 'Night (After 7 PM)' },
];

export const ShowFilters = ({
  languages = [],
  selectedLanguage = 'all',
  onSelectLanguage,
  selectedPrice = 'all',
  onSelectPrice,
  selectedTime = 'all',
  onSelectTime,
  onResetFilters,
  className = '',
}) => {
  const hasActiveFilters =
    selectedLanguage !== 'all' ||
    selectedPrice !== 'all' ||
    selectedTime !== 'all';

  return (
    <div
      className={`bg-white border-b border-border py-3 px-4 sm:px-6 ${className}`}
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink mr-1">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filters:</span>
          </div>

          {/* Language Selector */}
          {languages.length > 0 && (
            <div className="relative inline-block">
              <select
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="appearance-none bg-gray-50 border border-border text-ink text-xs font-semibold py-1.5 pl-3 pr-7 rounded-sm focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
                aria-label="Filter by Language"
              >
                <option value="all">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Price Range Selector */}
          <div className="relative inline-block">
            <select
              value={selectedPrice}
              onChange={(e) => onSelectPrice(e.target.value)}
              className="appearance-none bg-gray-50 border border-border text-ink text-xs font-semibold py-1.5 pl-3 pr-7 rounded-sm focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Filter by Price Range"
            >
              {PRICE_RANGES.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Preferred Time Selector */}
          <div className="relative inline-block">
            <select
              value={selectedTime}
              onChange={(e) => onSelectTime(e.target.value)}
              className="appearance-none bg-gray-50 border border-border text-ink text-xs font-semibold py-1.5 pl-3 pr-7 rounded-sm focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Filter by Preferred Time"
            >
              {TIME_RANGES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Reset Filters Action */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShowFilters;
