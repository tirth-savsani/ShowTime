import React, { useState } from 'react';

/**
 * Pure SVG Line Chart (Spec C7: No heavy external chart library)
 * Displays bookings trend over the last 14 days with hover tooltips.
 */
export const LineChart = ({ data = [], height = 220 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-muted">
        No daily data available.
      </div>
    );
  }

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const maxVal = Math.max(...data.map((d) => d.bookings || 0), 5);

  const points = data.map((d, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * innerWidth;
    const y = height - paddingY - ((d.bookings || 0) / maxVal) * innerHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E63946" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E63946" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = height - paddingY - ratio * innerHeight;
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area Fill */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}

        {/* Line Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#E63946"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive Data Point Circles */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint === idx ? 6 : 4}
              fill="#E63946"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPoint !== null && points[hoveredPoint] && (
        <div
          className="absolute z-30 pointer-events-none bg-navy text-white text-[11px] font-semibold py-1 px-2.5 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${(points[hoveredPoint].y / height) * 100}%`,
            marginTop: '-8px',
          }}
        >
          <div>Date: {points[hoveredPoint].data.date}</div>
          <div className="text-primary-light">
            Bookings: {points[hoveredPoint].data.bookings}
          </div>
          <div className="text-gray-300">
            Revenue: ₹{points[hoveredPoint].data.revenue}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Pure SVG Bar Chart (Spec C7: No heavy external chart library)
 * Displays top movies by revenue with hover tooltips.
 */
export const BarChart = ({ data = [], height = 220 }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-muted">
        No top movie sales yet.
      </div>
    );
  }

  const width = 600;
  const paddingX = 40;
  const paddingBottom = 45;
  const paddingTop = 20;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingBottom - paddingTop;

  const maxVal = Math.max(...data.map((d) => d.revenue || 0), 1000);
  const barWidth = Math.min(60, (innerWidth / data.length) * 0.6);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        {/* Horizontal Baseline */}
        <line
          x1={paddingX}
          y1={height - paddingBottom}
          x2={width - paddingX}
          y2={height - paddingBottom}
          stroke="#E5E7EB"
          strokeWidth="1.5"
        />

        {data.map((item, idx) => {
          const slotWidth = innerWidth / data.length;
          const x = paddingX + idx * slotWidth + (slotWidth - barWidth) / 2;
          const barHeight = Math.max(
            4,
            ((item.revenue || 0) / maxVal) * innerHeight
          );
          const y = height - paddingBottom - barHeight;
          const isHovered = hoveredBar === idx;

          return (
            <g key={item.movieId || idx}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill={isHovered ? '#D90429' : '#E63946'}
                className="cursor-pointer transition-colors duration-150"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              />

              {/* Title label beneath bar */}
              <text
                x={x + barWidth / 2}
                y={height - paddingBottom + 16}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#4B5563"
                className="pointer-events-none"
              >
                {item.title ? (item.title.length > 10 ? `${item.title.slice(0, 8)}..` : item.title) : `Movie ${idx + 1}`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredBar !== null && data[hoveredBar] && (
        <div
          className="absolute z-30 pointer-events-none bg-navy text-white text-[11px] font-semibold py-1.5 px-3 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{
            left: `${
              ((paddingX +
                hoveredBar * (innerWidth / data.length) +
                (innerWidth / data.length) / 2) /
                width) *
              100
            }%`,
            top: '40%',
          }}
        >
          <div className="font-bold">{data[hoveredBar].title}</div>
          <div className="text-primary-light">Revenue: ₹{data[hoveredBar].revenue}</div>
          <div className="text-gray-300">Bookings: {data[hoveredBar].bookings}</div>
        </div>
      )}
    </div>
  );
};


