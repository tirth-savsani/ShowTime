import React from 'react';

export const SeatItem = ({
  seat,
  categoryName = '',
  price = 0,
  isSelected = false,
  onToggle,
}) => {
  if (!seat) return null;

  const isBooked = seat.status === 'BOOKED';
  const isHeldByOther = seat.status === 'HELD';
  const isMine = seat.status === 'MINE';

  const isDisabled = isBooked || isHeldByOther;

  const handleClick = () => {
    if (isDisabled) return;
    onToggle(seat.id, seat);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // State styling matching UI Design System (Spec C4)
  let statusClasses = '';
  if (isDisabled) {
    statusClasses = 'bg-[#E5E7EB] text-gray-400 border border-gray-200 cursor-not-allowed opacity-80';
  } else if (isSelected) {
    statusClasses = 'bg-primary text-white border border-primary shadow-xs font-black scale-105';
  } else {
    statusClasses = 'bg-white text-[#059669] border border-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      className={`w-7 h-7 sm:w-7 sm:h-7 rounded-[4px] text-[11px] font-bold flex items-center justify-center select-none transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${statusClasses} ${
        seat.aisleAfter ? 'mr-5 sm:mr-6' : ''
      }`}
      aria-label={`Seat ${seat.id}, ${categoryName}, Rs ${price}, ${
        isDisabled ? 'Unavailable' : isSelected ? 'Selected' : 'Available'
      }`}
      aria-pressed={isSelected}
    >
      {seat.number}
    </button>
  );
};

export default SeatItem;
