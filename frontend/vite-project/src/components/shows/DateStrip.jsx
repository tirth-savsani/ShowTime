import React, { useMemo } from 'react';
 
const generate7Days = () => {
  const list = [];
  const base = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    list.push({
      isoDate,
      dayNumber: day,
      weekday,
      month: monthStr,
      isToday: i === 0,
    });
  }
  return list;
};

export const DateStrip = ({ selectedDate, onSelectDate, className = '' }) => {
  // Generate 7 consecutive dates starting from today
  const dates = useMemo(() => generate7Days(), []);

  return (
    <div
      className={`sticky top-16 md:top-[104px] z-30 bg-white border-b border-border shadow-xs ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-2.5">
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dates.map((item) => {
            const isSelected = item.isoDate === selectedDate;

            return (
              <button
                key={item.isoDate}
                type="button"
                onClick={() => onSelectDate(item.isoDate)}
                className={`flex-shrink-0 w-14 sm:w-16 py-2 px-1 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs font-bold scale-[1.02]'
                    : 'bg-white hover:bg-gray-100 text-ink border border-transparent hover:border-border'
                }`}
                aria-label={`Select show date ${item.weekday} ${item.dayNumber} ${item.month}`}
                aria-pressed={isSelected}
              >
                {/* Day of Week */}
                <span
                  className={`text-[10px] tracking-wider font-semibold ${
                    isSelected ? 'text-white/90' : 'text-muted'
                  }`}
                >
                  {item.isToday ? 'TODAY' : item.weekday}
                </span>

                {/* Day Number */}
                <span className="text-base sm:text-lg font-black leading-tight my-0.5">
                  {item.dayNumber}
                </span>

                {/* Month */}
                <span
                  className={`text-[10px] tracking-wider font-semibold ${
                    isSelected ? 'text-white/90' : 'text-muted'
                  }`}
                >
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateStrip;
