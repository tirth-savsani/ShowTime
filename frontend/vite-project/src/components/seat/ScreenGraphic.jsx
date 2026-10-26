import React from 'react';

export const ScreenGraphic = () => {
  return (
    <div className="flex flex-col items-center my-10 max-w-lg mx-auto w-full px-4 select-none">
      {/* Curved Screen Graphic */}
      <div className="relative w-full flex flex-col items-center">
        {/* Curved Screen Arc Bar */}
        <div className="w-full h-4 border-t-[3px] border-primary/50 rounded-t-[100%] shadow-[0_-6px_16px_rgba(230,57,70,0.18)]" />
        <span className="text-[11px] uppercase tracking-widest text-muted font-bold mt-1">
          All eyes this way please!
        </span>
      </div>

      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-border w-full text-xs text-muted">
        {/* Available */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[3px] border border-[#10B981] bg-white flex items-center justify-center text-[10px] text-[#059669] font-bold">
            1
          </div>
          <span>Available</span>
        </div>

        {/* Selected */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[3px] bg-primary border border-primary text-white flex items-center justify-center text-[10px] font-bold">
            1
          </div>
          <span>Selected</span>
        </div>

        {/* Sold / Held */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[3px] bg-[#E5E7EB] border border-gray-200 text-gray-400 flex items-center justify-center text-[10px]">
            1
          </div>
          <span>Sold</span>
        </div>
      </div>
    </div>
  );
};

export default ScreenGraphic;
