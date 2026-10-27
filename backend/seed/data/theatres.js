/**
 * Seed Data: Comprehensive Theatres & Screen Layouts (Spec B9, Phase 3)
 * 29 theatres across 10 popular Indian cities:
 * - Mumbai (4 theatres)
 * - Delhi-NCR (4 theatres)
 * - Bengaluru (4 theatres)
 * - Hyderabad (3 theatres)
 * - Ahmedabad (3 theatres)
 * - Chandigarh (2 theatres)
 * - Chennai (3 theatres)
 * - Pune (2 theatres)
 * - Kolkata (2 theatres)
 * - Kochi (2 theatres)
 */

export const layoutA = {
  // Large Screen: 220 Seats
  rows: [
    { label: 'A', seatCount: 10, category: 'PLATINUM', aisleAfter: [5] },
    { label: 'B', seatCount: 10, category: 'PLATINUM', aisleAfter: [5] },
    { label: 'C', seatCount: 20, category: 'GOLD', aisleAfter: [5, 15] },
    { label: 'D', seatCount: 20, category: 'GOLD', aisleAfter: [5, 15] },
    { label: 'E', seatCount: 20, category: 'GOLD', aisleAfter: [5, 15] },
    { label: 'F', seatCount: 20, category: 'GOLD', aisleAfter: [5, 15] },
    { label: 'G', seatCount: 20, category: 'GOLD', aisleAfter: [5, 15] },
    { label: 'H', seatCount: 20, category: 'GOLD', aisleAfter: [5, 15] },
    // Skip row 'I' to avoid confusion with 1 (Spec B9)
    { label: 'J', seatCount: 20, category: 'SILVER', aisleAfter: [5, 15] },
    { label: 'K', seatCount: 20, category: 'SILVER', aisleAfter: [5, 15] },
    { label: 'L', seatCount: 20, category: 'SILVER', aisleAfter: [5, 15] },
    { label: 'M', seatCount: 20, category: 'SILVER', aisleAfter: [5, 15] },
  ],
};

export const layoutB = {
  // Medium Screen: 140 Seats
  rows: [
    { label: 'A', seatCount: 8, category: 'PLATINUM', aisleAfter: [4] },
    { label: 'B', seatCount: 8, category: 'PLATINUM', aisleAfter: [4] },
    { label: 'C', seatCount: 16, category: 'GOLD', aisleAfter: [4, 12] },
    { label: 'D', seatCount: 16, category: 'GOLD', aisleAfter: [4, 12] },
    { label: 'E', seatCount: 16, category: 'GOLD', aisleAfter: [4, 12] },
    { label: 'F', seatCount: 16, category: 'GOLD', aisleAfter: [4, 12] },
    { label: 'G', seatCount: 15, category: 'SILVER', aisleAfter: [5, 10] },
    { label: 'H', seatCount: 15, category: 'SILVER', aisleAfter: [5, 10] },
    { label: 'J', seatCount: 15, category: 'SILVER', aisleAfter: [5, 10] },
    { label: 'K', seatCount: 15, category: 'SILVER', aisleAfter: [5, 10] },
  ],
};

export const layoutC = {
  // Small Boutique Screen: 80 Seats
  rows: [
    { label: 'A', seatCount: 8, category: 'PLATINUM', aisleAfter: [4] },
    { label: 'B', seatCount: 8, category: 'PLATINUM', aisleAfter: [4] },
    { label: 'C', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'D', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'E', seatCount: 12, category: 'GOLD', aisleAfter: [6] },
    { label: 'F', seatCount: 14, category: 'SILVER', aisleAfter: [7] },
    { label: 'G', seatCount: 14, category: 'SILVER', aisleAfter: [7] },
  ],
};

export const theatresData = [
  // --- MUMBAI (4) ---
  {
    name: 'PVR INOX Phoenix Palladium',
    city: 'Mumbai',
    address: '462 Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    amenities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Seats', 'Valet Parking', 'Gourmet Lounge'],
    screens: [
      { name: 'IMAX Audi 1', layout: layoutA },
      { name: 'Insignia Audi 2', layout: layoutB },
      { name: 'Classic Audi 3', layout: layoutC },
    ],
  },
  {
    name: 'Cinepolis Viviana Mall',
    city: 'Mumbai',
    address: 'Eastern Express Highway, Thane West, Mumbai 400606',
    amenities: ['4DX', 'VIP Recliners', 'Dolby 7.1', 'Food Court', 'Parking'],
    screens: [
      { name: '4DX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'PVR ICON Infiniti Andheri',
    city: 'Mumbai',
    address: 'Infiniti Mall, Link Road, Andheri West, Mumbai 400053',
    amenities: ['Dolby Atmos', 'Plush Recliners', 'Food & Beverage', 'Wheelchair Access'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'INOX Megaplex Inorbit Malad',
    city: 'Mumbai',
    address: 'Inorbit Mall, Link Road, Malad West, Mumbai 400064',
    amenities: ['ScreenX', 'MX4D', 'Dolby Atmos', 'Parking'],
    screens: [
      { name: 'ScreenX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },

  // --- DELHI-NCR (4) ---
  {
    name: 'PVR Directors Cut Ambience Mall',
    city: 'Delhi-NCR',
    address: 'Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
    amenities: ['Luxury Recliner', 'Chef Menu', 'Dolby Atmos', 'Valet Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'INOX Insignia Epicuria Nehru Place',
    city: 'Delhi-NCR',
    address: 'Epicuria Food Mall, Nehru Place Metro Station, New Delhi 110019',
    amenities: ['Laser Projection', 'Dolby Atmos', 'Gourmet Bar', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },
  {
    name: 'Cinepolis DLF Avenue Saket',
    city: 'Delhi-NCR',
    address: 'DLF Avenue Mall, Saket District Centre, New Delhi 110017',
    amenities: ['Dolby Atmos', 'Macro XE', 'Food Court', 'Wheelchair Access'],
    screens: [
      { name: 'Macro XE Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'PVR Select Citywalk',
    city: 'Delhi-NCR',
    address: 'Select Citywalk Mall, A-3 District Centre, Saket, New Delhi 110017',
    amenities: ['IMAX', 'Gold Class', 'Dolby Atmos', 'Parking'],
    screens: [
      { name: 'IMAX Audi 1', layout: layoutA },
      { name: 'Gold Audi 2', layout: layoutC },
    ],
  },

  // --- BENGALURU (4) ---
  {
    name: 'PVR Forum Koramangala',
    city: 'Bengaluru',
    address: 'The Forum Mall, Hosur Road, Koramangala, Bengaluru 560095',
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'Parking', 'Food Court'],
    screens: [
      { name: 'IMAX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Orion Cinemas Malleshwaram',
    city: 'Bengaluru',
    address: 'Level 3, Orion Mall, Dr. Rajkumar Road, Malleshwaram, Bengaluru 560055',
    amenities: ['Dolby Atmos', 'PXL Large Format', 'Parking', 'Food Court'],
    screens: [
      { name: 'PXL Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'INOX Nexus Mall Whitefield',
    city: 'Bengaluru',
    address: 'Nexus Whitefield Mall, Whitefield Main Road, Bengaluru 560066',
    amenities: ['Dolby Atmos', 'Club Class', 'Parking', 'Cafeteria'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutC },
    ],
  },
  {
    name: 'Cinepolis Forum South Bengaluru',
    city: 'Bengaluru',
    address: 'Forum South Bangalore, Konanakunte Cross, Kanakapura Road, Bengaluru 560062',
    amenities: ['4DX', 'VIP Lounge', 'Dolby 7.1', 'Parking'],
    screens: [
      { name: '4DX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },

  // --- HYDERABAD (3) ---
  {
    name: 'Prasads Multiplex Necklaceroad',
    city: 'Hyderabad',
    address: 'NTR Gardens, Necklace Road, Khairatabad, Hyderabad 500063',
    amenities: ['Large Screen PCX', 'Dolby Atmos', 'Food Court', 'Lake View Lounge'],
    screens: [
      { name: 'PCX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'AMB Cinemas Gachibowli',
    city: 'Hyderabad',
    address: 'Sarath City Capital Mall, Gachibowli - Miyapur Road, Hyderabad 500084',
    amenities: ['Laser Projection', 'V-VIP Lounge', 'Dolby Atmos', 'Valet Parking'],
    screens: [
      { name: 'Screen 1', layout: layoutA },
      { name: 'Screen 2', layout: layoutB },
    ],
  },
  {
    name: 'PVR Next Galleria Punjagutta',
    city: 'Hyderabad',
    address: 'Next Galleria Mall, Punjagutta Main Road, Hyderabad 500082',
    amenities: ['4DX', 'Dolby Atmos', 'Parking', 'Food Court'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },

  // --- AHMEDABAD (3) ---
  {
    name: 'Cinepolis Ahmedabad One',
    city: 'Ahmedabad',
    address: 'Ahmedabad One Mall, Vastrapur Lake, Vastrapur, Ahmedabad 380015',
    amenities: ['VIP Lounge', 'Dolby Atmos', 'Food Court', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'PVR Acropolis Thaltej',
    city: 'Ahmedabad',
    address: 'Acropolis Mall, SG Highway, Thaltej, Ahmedabad 380054',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Wide Angle SG Highway',
    city: 'Ahmedabad',
    address: 'SG Highway, Opp. Iskcon Temple, Satellite, Ahmedabad 380015',
    amenities: ['Dolby Digital 7.1', 'Spacious Seating', 'Food Stalls', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },

  // --- CHANDIGARH (2) ---
  {
    name: 'PVR Elante Mall',
    city: 'Chandigarh',
    address: 'Elante Mall, Industrial Area Phase 1, Chandigarh 160002',
    amenities: ['Gold Class', 'Dolby Atmos', 'Food Court', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Cinepolis Jagat Mall',
    city: 'Chandigarh',
    address: 'Jagat Mall, Sector 17, Chandigarh 160017',
    amenities: ['Dolby 7.1', 'Plush Pushback Seats', 'Snack Bar'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },

  // --- CHENNAI (3) ---
  {
    name: 'SPI Palazzo Vijaya Mall',
    city: 'Chennai',
    address: 'The Forum Vijaya Mall, Arcot Road, Vadapalani, Chennai 600026',
    amenities: ['Dolby Atmos', 'IMAX', 'Caramel Popcorn Counter', 'Parking'],
    screens: [
      { name: 'IMAX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'PVR Express Avenue',
    city: 'Chennai',
    address: 'Express Avenue Mall, Whites Road, Royapettah, Chennai 600014',
    amenities: ['Escape Cinema', 'Dolby Atmos', 'Food Court', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'AGS Cinemas T Nagar',
    city: 'Chennai',
    address: 'Bazullah Road, T. Nagar, Chennai 600017',
    amenities: ['4K RGB Laser', 'Dolby Atmos', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },

  // --- PUNE (2) ---
  {
    name: 'PVR Pavilion Mall SB Road',
    city: 'Pune',
    address: 'The Pavillion Mall, Senapati Bapat Road, Shivajinagar, Pune 411016',
    amenities: ['IMAX', 'Dolby Atmos', 'PVR Icon', 'Parking'],
    screens: [
      { name: 'IMAX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Cinepolis Seasons Mall Magarpatta',
    city: 'Pune',
    address: 'Seasons Mall, Magarpatta City, Hadapsar, Pune 411028',
    amenities: ['VIP Recliner', 'Dolby Atmos', 'Food Court', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },

  // --- KOLKATA (2) ---
  {
    name: 'INOX South City Mall',
    city: 'Kolkata',
    address: 'South City Mall, 375 Prince Anwar Shah Road, Kolkata 700068',
    amenities: ['IMAX', 'Insignia', 'Dolby Atmos', 'Valet Parking'],
    screens: [
      { name: 'IMAX Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'PVR Quest Mall',
    city: 'Kolkata',
    address: 'Quest Mall, Syed Amir Ali Avenue, Park Circus, Kolkata 700017',
    amenities: ['Gold Class', 'Dolby Atmos', 'Gourmet Food', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },

  // --- KOCHI (2) ---
  {
    name: 'PVR LuLu Mall',
    city: 'Kochi',
    address: 'LuLu International Shopping Mall, Edappally, Kochi 682024',
    amenities: ['Dolby Atmos', '4K Projection', 'Food Court', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutA },
      { name: 'Audi 2', layout: layoutB },
    ],
  },
  {
    name: 'Cinepolis Centre Square Mall',
    city: 'Kochi',
    address: 'Centre Square Mall, MG Road, Shenoys, Kochi 682035',
    amenities: ['VIP Class', 'Dolby 7.1', 'Metro Connectivity', 'Parking'],
    screens: [
      { name: 'Audi 1', layout: layoutB },
      { name: 'Audi 2', layout: layoutC },
    ],
  },
];
