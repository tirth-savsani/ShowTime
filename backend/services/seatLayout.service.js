/**
 * Pure functions for Seat Layout and Seat ID generation (Spec B6.1)
 */

export const generateSeats = (layout) => {
  if (!layout || !Array.isArray(layout.rows)) {
    return [];
  }

  const seats = [];
  for (const row of layout.rows) {
    const aisleSet = new Set(row.aisleAfter || []);
    for (let n = 1; n <= row.seatCount; n++) {
      seats.push({
        id: `${row.label}${n}`,
        row: row.label,
        number: n,
        category: row.category,
        aisleAfter: aisleSet.has(n),
      });
    }
  }
  return seats;
};

export const generateSeatIds = (layout) => {
  return generateSeats(layout);
};

export const calculateTotalSeats = (layout) => {
  if (!layout || !Array.isArray(layout.rows)) return 0;
  return layout.rows.reduce((sum, row) => sum + (row.seatCount || 0), 0);
};

export const extractCategories = (layout) => {
  if (!layout || !Array.isArray(layout.rows)) return [];
  const categories = new Set();
  for (const row of layout.rows) {
    if (row.category) categories.add(row.category);
  }
  return Array.from(categories);
};

export default {
  generateSeats,
  generateSeatIds,
  calculateTotalSeats,
  extractCategories,
};
