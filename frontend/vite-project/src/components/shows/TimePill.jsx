import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openAuthModal, setRedirectTo } from '../../store/slices/authSlice.js';
import { setShowId } from '../../store/slices/bookingSlice.js';

export const TimePill = ({ show }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, user } = useSelector((state) => state.auth);

  if (!show) return null;

  const isAuthenticated = status === 'authenticated' && user;
  const isSoldOut = show.availability === 'SOLD_OUT';
  const isFillingFast = show.availability === 'FILLING_FAST';

  // Format startTime (e.g. 2026-10-27T10:30:00.000Z -> "10:30 AM")
  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const formattedTime = formatTime(show.startTime);

  // Pricing tooltip breakdown
  const pricingEntries = show.pricing ? Object.entries(show.pricing) : [];
  const tooltipText = pricingEntries.length > 0
    ? pricingEntries.map(([cat, pr]) => `${cat}: ₹${pr}`).join('  •  ')
    : show.priceFrom && show.priceTo
      ? `₹${show.priceFrom} - ₹${show.priceTo}`
      : 'Pricing available at checkout';

  const handleClick = () => {
    if (isSoldOut) return;

    const targetUrl = `/shows/${show.id}/seats`;
    dispatch(setShowId(show.id));

    if (!isAuthenticated) {
      // Prompt sign in for guest, then return to seat selection
      dispatch(setRedirectTo(targetUrl));
      dispatch(openAuthModal('login'));
    } else {
      navigate(targetUrl);
    }
  };

  // Color theme classes by availability (Spec C4)
  let statusClasses = 'border-emerald-500 text-emerald-700 bg-emerald-50/20 hover:bg-emerald-50 hover:shadow-xs';
  if (isSoldOut) {
    statusClasses = 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed line-through opacity-70';
  } else if (isFillingFast) {
    statusClasses = 'border-amber-500 text-amber-700 bg-amber-50/20 hover:bg-amber-50 hover:shadow-xs';
  }

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSoldOut}
        className={`w-[96px] sm:w-[104px] py-2 px-1 rounded-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${statusClasses}`}
        aria-label={`${formattedTime} ${show.format || ''} show, ${show.availability}`}
      >
        {/* Time */}
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          {formattedTime}
        </span>

        {/* Subtitle Format / Screen */}
        <div className="flex items-center gap-1 text-[10px] uppercase font-semibold opacity-85 truncate max-w-[90px]">
          <span>{show.format || '2D'}</span>
          {show.language && (
            <>
              <span>•</span>
              <span className="truncate">{show.language}</span>
            </>
          )}
        </div>
      </button>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
        <div className="bg-navy text-white text-[11px] font-medium py-1.5 px-3 rounded-md shadow-lg whitespace-nowrap">
          <div className="font-semibold text-primary-light">
            {isSoldOut ? 'Sold Out' : isFillingFast ? 'Filling Fast' : 'Available'}
          </div>
          <div className="text-gray-200">{tooltipText}</div>
        </div>
        {/* Tooltip Arrow */}
        <div className="w-2 h-2 bg-navy rotate-45 -mt-1" />
      </div>
    </div>
  );
};

export default TimePill;
