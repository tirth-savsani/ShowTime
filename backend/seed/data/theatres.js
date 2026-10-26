/**
 * Seed Data: Theatres & Screen Layouts (Spec B9)
 * 4 theatres across 3 cities:
 * - Bengaluru: Orion Cinemas, Galaxy Multiplex
 * - Mumbai: Regal Screens
 * - Delhi NCR: Star Cinema
 * Each has 2 screens: Audi 1 (Layout A: 164 seats) and Audi 2 (Layout B: 76 seats).
 */

export const layoutA = {
  rows: [
    { label: 'A', seatCount: 10, category: 'PLATINUM', aisleAfter: [5] },
    { label: 'B', seatCount: 10, category: 'PLATINUM', aisleAfter: [5] },
    { label: 'C', seatCount: 10, category: 'PLATINUM', aisleAfter: [5] },
    { label: 'D', seatCount: 14, category: 'GOLD', aisleAfter: [4, 10] },
    { label: 'E', seatCount: 14, category: 'GOLD', aisleAfter: [4, 10] },
    { label: 'F', seatCount: 14, category: 'GOLD', aisleAfter: [4, 10] },
    { label: 'G', seatCount: 14, category: 'GOLD', aisleAfter: [4, 10] },
    { label: 'H', seatCount: 14, category: 'GOLD', aisleAfter: [4, 10] },
    // Skip row 'I' to avoid confusion with 1 (Spec B9)
    { label: 'J', seatCount: 16, category: 'SILVER', aisleAfter: [4, 12] },
    { label: 'K', seatCount: 16, category: 'SILVER', aisleAfter: [4, 12] },
    { label: 'L', seatCount: 16, category: 'SILVER', aisleAfter: [4, 12] },
    { label: 'M', seatCount: 16, category: 'SILVER', aisleAfter: [4, 12] },
  ],
};

export const layoutB = {
  rows: [
    { label: 'A', seatCount: 8, category: 'PLATINUM', aisleAfter: [4] },
    { label: 'B', seatCount: 8, category: 'PLATINUM', aisleAfter: [4] },
    { label: 'C', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'D', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'E', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'F', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'G', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
  ],
};

export const theatresData = [
  {
    name: 'Orion Cinemas',
    city: 'Bengaluru',
    address: 'Level 3, Orion Mall, Dr. Rajkumar Road, Malleshwaram, Bengaluru 560055',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Parking', 'Food Court', 'Wheelchair Access'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Galaxy Multiplex',
    city: 'Bengaluru',
    address: 'Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru 560025',
    amenities: ['4K Laser Projection', 'Dolby 7.1', 'Parking', 'Gourmet Cafeteria'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Regal Screens',
    city: 'Mumbai',
    address: 'Colaba Causeway, Apollo Bandar, Colaba, Mumbai 400001',
    amenities: ['Dolby Atmos', 'IMAX Laser', 'Valet Parking', 'Wheelchair Access'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Star Cinema',
    city: 'Delhi NCR',
    address: 'Sector 38A, Entertainment City, Noida, Uttar Pradesh 201301',
    amenities: ['Dolby Atmos', '4DX Sensory', 'Food Lounge', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
];

export default theatresData;
