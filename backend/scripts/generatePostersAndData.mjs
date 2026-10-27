/**
 * Script: Generate 50 Curated Movies & 100 High-Res SVG Posters (Phase 3)
 *
 * Produces:
 * 1. backend/seed/data/movies.js: 50 movies (38 now_showing, 12 coming_soon) with realistic metadata
 * 2. frontend/vite-project/public/posters/{slug}.svg (vertical 2:3 poster)
 * 3. frontend/vite-project/public/posters/{slug}-wide.svg (horizontal 16:9 backdrop)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postersDir = path.resolve(__dirname, '../../frontend/vite-project/public/posters');
const moviesDataFile = path.resolve(__dirname, '../seed/data/movies.js');

if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

// 50 Curated Movies definitions
const rawMovies = [
  // --- 38 NOW SHOWING ---
  {
    title: 'Jawan: Extended Cut',
    slug: 'jawan-extended-cut',
    description: 'A high-octane emotional journey of a prison warden driven by a deep personal vendetta to rectify the wrongs in society while keeping a promise made years ago.',
    genres: ['Action', 'Thriller'],
    languages: ['Hindi', 'Tamil', 'Telugu'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 169,
    releaseDate: '2026-09-07',
    certificate: 'UA',
    rating: 8.8,
    votes: 218500,
    director: 'Atlee',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Shah Rukh Khan', role: 'Vikram & Azad Rathore', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Nayanthara', role: 'Narmada Rai', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Vijay Sethupathi', role: 'Kaleeshwaran', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Deepika Padukone', role: 'Aishwarya Rathore', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Salaar: Part 1 - Ceasefire',
    slug: 'salaar-part-1-ceasefire',
    description: 'In the lawless walled city of Khansaar, a hardened commander vows to protect his exiled childhood friend who returns to reclaim his rightful crown.',
    genres: ['Action', 'Crime', 'Drama'],
    languages: ['Telugu', 'Hindi', 'Kannada', 'Tamil'],
    formats: ['2D', 'IMAX'],
    durationMin: 175,
    releaseDate: '2026-08-25',
    certificate: 'A',
    rating: 8.3,
    votes: 182400,
    director: 'Prashanth Neel',
    status: 'now_showing',
    theme: 'noir',
    cast: [
      { name: 'Prabhas', role: 'Deva / Salaar', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Prithviraj Sukumaran', role: 'Varadharaja Mannaar', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
      { name: 'Shruti Haasan', role: 'Aadya', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
      { name: 'Jagapathi Babu', role: 'Raja Mannaar', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    ],
  },
  {
    title: 'Fighter',
    slug: 'fighter',
    description: 'Top Air Force aviators come together to form Air Dragons, confronting perilous international airspace skirmishes while dealing with interpersonal turmoil.',
    genres: ['Action', 'Thriller'],
    languages: ['Hindi', 'English'],
    formats: ['2D', '3D', 'IMAX', '4DX'],
    durationMin: 166,
    releaseDate: '2026-09-18',
    certificate: 'UA',
    rating: 8.2,
    votes: 145000,
    director: 'Siddharth Anand',
    status: 'now_showing',
    theme: 'cyber',
    cast: [
      { name: 'Hrithik Roshan', role: 'Sq Leader Shamsher Pathania', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Deepika Padukone', role: 'Sq Leader Minal Rathore', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Anil Kapoor', role: 'Gp Capt Rakesh Jai Singh', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Karan Singh Grover', role: 'Sq Leader Sartaj Gill', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80' },
    ],
  },
  {
    title: 'Kalki 2898 AD',
    slug: 'kalki-2898-ad',
    description: 'Set in a post-apocalyptic desert metropolis in the year 2898 AD, an ancient warrior awakened across millennia fights to protect the unborn vessel of divine hope.',
    genres: ['Sci-Fi', 'Action', 'Fantasy'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
    formats: ['2D', '3D', 'IMAX', '4DX'],
    durationMin: 181,
    releaseDate: '2026-09-22',
    certificate: 'UA',
    rating: 8.9,
    votes: 312000,
    director: 'Nag Ashwin',
    status: 'now_showing',
    theme: 'cosmic',
    cast: [
      { name: 'Prabhas', role: 'Bhairava', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Kamal Haasan', role: 'Supreme Yaskin', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Deepika Padukone', role: 'SUM-80', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Dunki',
    slug: 'dunki',
    description: 'Four small-town friends embark on a daring, heartwarming odyssey across continents through the perilous backdoor migrant route, seeking a better tomorrow.',
    genres: ['Comedy', 'Drama'],
    languages: ['Hindi', 'English'],
    formats: ['2D'],
    durationMin: 160,
    releaseDate: '2026-08-14',
    certificate: 'U',
    rating: 7.9,
    votes: 98000,
    director: 'Rajkumar Hirani',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Shah Rukh Khan', role: 'Hardayal Hardy Singh', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Taapsee Pannu', role: 'Manu Randhawa', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Boman Irani', role: 'Geetu Gulati', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Vicky Kaushal', role: 'Sukhi', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Animal',
    slug: 'animal',
    description: 'A transformative, turbulent drama about the fierce, obsessive bond between a tycoon father and his volatile son who spirals into bloody vengeance.',
    genres: ['Action', 'Crime', 'Drama'],
    languages: ['Hindi', 'Telugu', 'Tamil'],
    formats: ['2D', 'IMAX'],
    durationMin: 201,
    releaseDate: '2026-09-01',
    certificate: 'A',
    rating: 8.4,
    votes: 275000,
    director: 'Sandeep Reddy Vanga',
    status: 'now_showing',
    theme: 'blood',
    cast: [
      { name: 'Ranbir Kapoor', role: 'Ranvijay Singh', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Anil Kapoor', role: 'Balbir Singh', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Rashmika Mandanna', role: 'Geetanjali', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Bobby Deol', role: 'Abrar Haque', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    ],
  },
  {
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    description: 'The monumental biographical epic tracing theoretical physicist J. Robert Oppenheimer during the Manhattan Project and the subsequent fallout of the nuclear age.',
    genres: ['Biography', 'Drama', 'History'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 180,
    releaseDate: '2026-07-21',
    certificate: 'A',
    rating: 9.2,
    votes: 489000,
    director: 'Christopher Nolan',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Matt Damon', role: 'Leslie Groves', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    description: 'Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family, confronting his dread prophecy.',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 166,
    releaseDate: '2026-08-30',
    certificate: 'UA',
    rating: 9.1,
    votes: 395000,
    director: 'Denis Villeneuve',
    status: 'now_showing',
    theme: 'amber',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Zendaya', role: 'Chani', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Austin Butler', role: 'Feyd-Rautha Harkonnen', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    ],
  },
  {
    title: 'Manjummel Boys',
    slug: 'manjummel-boys',
    description: 'A group of close-knit friends from Kochi travel to Kodaikanal where a harrowing subterranean accident in Guna Caves tests the limits of courage and brotherhood.',
    genres: ['Adventure', 'Thriller', 'Drama'],
    languages: ['Malayalam', 'Tamil', 'Telugu', 'Hindi'],
    formats: ['2D'],
    durationMin: 135,
    releaseDate: '2026-09-05',
    certificate: 'U',
    rating: 8.9,
    votes: 164000,
    director: 'Chidambaram',
    status: 'now_showing',
    theme: 'emerald',
    cast: [
      { name: 'Soubin Shahir', role: 'Kuttan', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Sreenath Bhasi', role: 'Subhash', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Balu Varghese', role: 'Sixen', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
      { name: 'Ganapathi', role: 'Sudhi', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80' },
    ],
  },
  {
    title: 'Aadujeevitham - The Goat Life',
    slug: 'aadujeevitham-the-goat-life',
    description: 'Based on the acclaimed novel, an immigrant laborer forced into servitude as a goatherd in the harsh Saudi Arabian desert undertakes an unimaginable escape.',
    genres: ['Adventure', 'Biography', 'Drama'],
    languages: ['Malayalam', 'Tamil', 'Hindi', 'Kannada'],
    formats: ['2D'],
    durationMin: 172,
    releaseDate: '2026-08-20',
    certificate: 'UA',
    rating: 8.7,
    votes: 112000,
    director: 'Blessy',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Prithviraj Sukumaran', role: 'Najeeb Muhammad', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Jimmy Jean-Louis', role: 'Ibrahim Khadiri', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Amala Paul', role: 'Sainu', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'KR Gokul', role: 'Hakeem', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Hanu-Man',
    slug: 'hanu-man',
    description: 'A modest thief in an idyllic village acquires extraordinary divine abilities through a sun gem, becoming the reluctant champion against modern biomechanical evil.',
    genres: ['Action', 'Fantasy', 'Adventure'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada'],
    formats: ['2D', '3D'],
    durationMin: 158,
    releaseDate: '2026-07-28',
    certificate: 'U',
    rating: 8.6,
    votes: 198000,
    director: 'Prasanth Varma',
    status: 'now_showing',
    theme: 'amber',
    cast: [
      { name: 'Teja Sajja', role: 'Hanumanthu', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Amritha Aiyer', role: 'Meenakshi', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Varalaxmi Sarathkumar', role: 'Anjamma', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
      { name: 'Vinay Rai', role: 'Michael', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'Leo',
    slug: 'leo',
    description: 'A quiet animal rescuer and cafe owner in Himachal Pradesh is thrust into explosive chaos when dangerous cartel figures mistake him for an infamous mob kingpin.',
    genres: ['Action', 'Thriller', 'Crime'],
    languages: ['Tamil', 'Telugu', 'Hindi', 'Kannada'],
    formats: ['2D', 'IMAX'],
    durationMin: 164,
    releaseDate: '2026-09-02',
    certificate: 'A',
    rating: 8.1,
    votes: 230000,
    director: 'Lokesh Kanagaraj',
    status: 'now_showing',
    theme: 'blood',
    cast: [
      { name: 'Thalapathy Vijay', role: 'Parthiban / Leo Das', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Sanjay Dutt', role: 'Antony Das', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Trisha Krishnan', role: 'Sathya', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Arjun Sarja', role: 'Harold Das', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Jailer',
    slug: 'jailer',
    description: 'A retired prison warden leads an unassuming domestic life until a brazen artifact smuggling syndicate targets his law enforcement son, unleashing his dormant fury.',
    genres: ['Action', 'Comedy', 'Crime'],
    languages: ['Tamil', 'Telugu', 'Hindi', 'Kannada'],
    formats: ['2D', 'IMAX'],
    durationMin: 168,
    releaseDate: '2026-08-10',
    certificate: 'UA',
    rating: 8.4,
    votes: 210000,
    director: 'Nelson Dilipkumar',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Rajinikanth', role: 'Muthuvel Pandian', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Mohanlal', role: 'Mathew', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Shiva Rajkumar', role: 'Narasimha', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Ramya Krishnan', role: 'Vijaya Pandian', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: '12th Fail',
    slug: 'twelfth-fail',
    description: 'The stirring true story of Manoj Kumar Sharma who restarts his academic journey from abject poverty to conquering the nation’s toughest civil service exams.',
    genres: ['Biography', 'Drama'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 147,
    releaseDate: '2026-08-01',
    certificate: 'U',
    rating: 9.4,
    votes: 380000,
    director: 'Vidhu Vinod Chopra',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Vikrant Massey', role: 'Manoj Kumar Sharma', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Medha Shankr', role: 'Shraddha Joshi', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Anant V Joshi', role: 'Pritam Pandey', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Anshumaan Pushkar', role: 'Gauri Bhaiya', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
    ],
  },
  {
    title: 'Shaitaan',
    slug: 'shaitaan',
    description: 'A relaxing family weekend getaway turns into an excruciating supernatural hostage battle when an enigmatic stranger manipulates their daughter with dark hypnosis.',
    genres: ['Horror', 'Thriller'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 132,
    releaseDate: '2026-09-10',
    certificate: 'A',
    rating: 7.8,
    votes: 89000,
    director: 'Vikas Bahl',
    status: 'now_showing',
    theme: 'noir',
    cast: [
      { name: 'Ajay Devgn', role: 'Kabir Rishi', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'R. Madhavan', role: 'Vanraj', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Jyotika', role: 'Jyoti Rishi', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Janki Bodiwala', role: 'Janvi Rishi', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
    ],
  },
  {
    title: 'Article 370',
    slug: 'article-370',
    description: 'In the wake of civil unrest in Kashmir, an intelligence operative is selected for a covert operation to eliminate conflict economy and facilitate state integration.',
    genres: ['Action', 'Drama', 'Thriller'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 158,
    releaseDate: '2026-08-15',
    certificate: 'UA',
    rating: 8.2,
    votes: 94000,
    director: 'Aditya Suhas Jambhale',
    status: 'now_showing',
    theme: 'emerald',
    cast: [
      { name: 'Yami Gautam', role: 'Zooni Haksar', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Priyamani', role: 'Rajeshwari Swaminathan', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Arun Govil', role: 'Prime Minister', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Kiran Karmarkar', role: 'Home Minister', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Premalu',
    slug: 'premalu',
    description: 'An easygoing engineering graduate moves to Hyderabad for GATE coaching where he falls head-over-heels for a spunky software professional with rival suitors.',
    genres: ['Comedy', 'Romance'],
    languages: ['Malayalam', 'Telugu', 'Tamil'],
    formats: ['2D'],
    durationMin: 156,
    releaseDate: '2026-08-05',
    certificate: 'U',
    rating: 8.5,
    votes: 126000,
    director: 'Girish A.D.',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Naslen K. Gafoor', role: 'Sachin', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Mamitha Baiju', role: 'Reenu', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Shyam Mohan', role: 'Aadhi', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Sangeeth Prathap', role: 'Amal Davis', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
    ],
  },
  {
    title: 'Godzilla x Kong: The New Empire',
    slug: 'godzilla-x-kong-the-new-empire',
    description: 'An explosive battle pits the almighty Kong and fearsome Godzilla against a colossal undiscovered threat hidden deep within our hollow earth.',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['2D', '3D', 'IMAX', '4DX'],
    durationMin: 115,
    releaseDate: '2026-09-08',
    certificate: 'UA',
    rating: 7.6,
    votes: 215000,
    director: 'Adam Wingard',
    status: 'now_showing',
    theme: 'cyber',
    cast: [
      { name: 'Rebecca Hall', role: 'Dr. Ilene Andrews', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Brian Tyree Henry', role: 'Bernie Hayes', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Dan Stevens', role: 'Trapper', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Kaylee Hottle', role: 'Jia', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
    ],
  },
  {
    title: 'Kung Fu Panda 4',
    slug: 'kung-fu-panda-4',
    description: 'Po must train a new Dragon Warrior while battling a shape-shifting sorceress named The Chameleon who can re-summon villains from the spirit realm.',
    genres: ['Animation', 'Action', 'Comedy'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['2D', '3D'],
    durationMin: 94,
    releaseDate: '2026-08-11',
    certificate: 'U',
    rating: 7.7,
    votes: 110000,
    director: 'Mike Mitchell',
    status: 'now_showing',
    theme: 'amber',
    cast: [
      { name: 'Jack Black', role: 'Po (voice)', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Awkwafina', role: 'Zhen (voice)', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Viola Davis', role: 'The Chameleon (voice)', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Dustin Hoffman', role: 'Master Shifu (voice)', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    ],
  },
  {
    title: 'Aavesham',
    slug: 'aavesham',
    description: 'Three young engineering students in Bengaluru get bullied by seniors and recruit a quirky local gangster named Ranga to teach their college rivals a lesson.',
    genres: ['Action', 'Comedy'],
    languages: ['Malayalam', 'Tamil', 'Telugu', 'Hindi'],
    formats: ['2D'],
    durationMin: 158,
    releaseDate: '2026-09-12',
    certificate: 'UA',
    rating: 8.8,
    votes: 184000,
    director: 'Jithu Madhavan',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Fahadh Faasil', role: 'Ranga', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Hipzster', role: 'Aju', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Mithun Jai Shankar', role: 'Bibi', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
      { name: 'Roshan Shanavas', role: 'Shanthakumaran', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Bramayugam',
    slug: 'bramayugam',
    description: 'A 17th-century folk singer fleeing slave trade seeks refuge in a mysterious crumbling manor whose enigmatic feudal master plays deadly ritualistic mind games.',
    genres: ['Horror', 'Mystery', 'Thriller'],
    languages: ['Malayalam', 'Tamil', 'Telugu', 'Kannada'],
    formats: ['2D'],
    durationMin: 139,
    releaseDate: '2026-08-28',
    certificate: 'A',
    rating: 8.6,
    votes: 142000,
    director: 'Rahul Sadasivan',
    status: 'now_showing',
    theme: 'noir',
    cast: [
      { name: 'Mammootty', role: 'Kodumon Potti', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Arjun Ashokan', role: 'Thevan', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Sidharth Bharathan', role: 'The Cook', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Amalda Liz', role: 'Yakshi', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    ],
  },
  {
    title: 'Captain Miller',
    slug: 'captain-miller',
    description: 'In 1930s British India, a renegade former colonial soldier turned rebel warrior leads daring raids against oppressor forces to safeguard his people’s heritage.',
    genres: ['Action', 'Adventure', 'Drama'],
    languages: ['Tamil', 'Telugu', 'Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 157,
    releaseDate: '2026-08-08',
    certificate: 'UA',
    rating: 7.9,
    votes: 81000,
    director: 'Arun Matheswaran',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Dhanush', role: 'Analeesan / Captain Miller', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Shiva Rajkumar', role: 'Sengolan', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Priyanka Arul Mohan', role: 'Velmathi', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Sundeep Kishan', role: 'Captain Rafi', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
    ],
  },
  {
    title: 'Merry Christmas',
    slug: 'merry-christmas',
    description: 'On Christmas Eve in 1980s Mumbai, two strangers meet by chance and forge a seductive connection that spirals into a night of deception, murder and intrigue.',
    genres: ['Mystery', 'Thriller', 'Romance'],
    languages: ['Hindi', 'Tamil'],
    formats: ['2D'],
    durationMin: 144,
    releaseDate: '2026-07-15',
    certificate: 'UA',
    rating: 7.8,
    votes: 62000,
    director: 'Sriram Raghavan',
    status: 'now_showing',
    theme: 'noir',
    cast: [
      { name: 'Katrina Kaif', role: 'Maria', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Vijay Sethupathi', role: 'Albert', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Sanjay Kapoor', role: 'Ronnie', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Radhika Apte', role: 'Cameo Officer', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Teri Baaton Mein Aisa Uljha Jiya',
    slug: 'teri-baaton-mein-aisa-uljha-jiya',
    description: 'A robotics programmer falls helplessly in love with a charming, intelligent woman in the United States, unaware that she is a state-of-the-art AI android.',
    genres: ['Comedy', 'Romance', 'Sci-Fi'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 143,
    releaseDate: '2026-08-04',
    certificate: 'U',
    rating: 7.4,
    votes: 79000,
    director: 'Amit Joshi',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Shahid Kapoor', role: 'Aryan Agnihotri', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Kriti Sanon', role: 'SIFRA', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Dharmendra', role: 'Jai Singh', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Dimple Kapadia', role: 'Urmila Shukla', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Madgaon Express',
    slug: 'madgaon-express',
    description: 'Three childhood buddies finally fulfill their dream trip to Goa on the Madgaon Express, only to mistakenly take luggage packed with contraband and mob guns.',
    genres: ['Comedy', 'Adventure'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 143,
    releaseDate: '2026-08-22',
    certificate: 'UA',
    rating: 8.3,
    votes: 115000,
    director: 'Kunal Kemmu',
    status: 'now_showing',
    theme: 'amber',
    cast: [
      { name: 'Divyenndu', role: 'Dhanush / Dodo', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Pratik Gandhi', role: 'Pratik / Pinku', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Avinash Tiwary', role: 'Ayush', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Nora Fatehi', role: 'Tasha', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    ],
  },
  {
    title: 'Crew',
    slug: 'crew',
    description: 'Three spirited flight attendants for a bankrupt airline get swept into an absurd, lucrative gold-smuggling heist when a passenger dies mid-flight.',
    genres: ['Comedy', 'Drama'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 120,
    releaseDate: '2026-08-18',
    certificate: 'UA',
    rating: 7.6,
    votes: 82000,
    director: 'Rajesh A Krishnan',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Tabu', role: 'Geeta Sethi', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Kareena Kapoor Khan', role: 'Jasmine Kohli', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Kriti Sanon', role: 'Divya Rana', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
      { name: 'Diljit Dosanjh', role: 'Jaiveer Singh', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'The Fall Guy',
    slug: 'the-fall-guy',
    description: 'A battle-scarred Hollywood stuntman is called out of retirement to find a missing movie star, untangle a sinister conspiracy, and win back his director ex.',
    genres: ['Action', 'Comedy'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 126,
    releaseDate: '2026-07-29',
    certificate: 'UA',
    rating: 7.8,
    votes: 148000,
    director: 'David Leitch',
    status: 'now_showing',
    theme: 'cyber',
    cast: [
      { name: 'Ryan Gosling', role: 'Colt Seavers', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Emily Blunt', role: 'Jody Moreno', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Aaron Taylor-Johnson', role: 'Tom Ryder', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Hannah Waddingham', role: 'Gail Meyer', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    ],
  },
  {
    title: 'Furiosa: A Mad Max Saga',
    slug: 'furiosa-a-mad-max-saga',
    description: 'Kidnapped from the Green Place of Many Mothers, young Furiosa survives warlord battles across the desolate Wasteland to seek her way home.',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 148,
    releaseDate: '2026-08-25',
    certificate: 'A',
    rating: 8.5,
    votes: 195000,
    director: 'George Miller',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Anya Taylor-Joy', role: 'Imperator Furiosa', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Chris Hemsworth', role: 'Warlord Dementus', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Tom Burke', role: 'Praetorian Jack', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Lachy Hulme', role: 'Immortan Joe', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'Kingdom of the Planet of the Apes',
    slug: 'kingdom-of-the-planet-of-the-apes',
    description: 'Centuries after Caesar’s reign, a young chimpanzee embarks on a dangerous journey with a feral human woman that will determine the future for apes and mankind.',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    languages: ['English', 'Hindi'],
    formats: ['2D', '3D', 'IMAX'],
    durationMin: 145,
    releaseDate: '2026-08-16',
    certificate: 'UA',
    rating: 7.9,
    votes: 132000,
    director: 'Wes Ball',
    status: 'now_showing',
    theme: 'emerald',
    cast: [
      { name: 'Owen Teague', role: 'Noa', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Freya Allan', role: 'Mae / Nova', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Kevin Durand', role: 'Proximus Caesar', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Peter Macon', role: 'Raka', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Chandu Champion',
    slug: 'chandu-champion',
    description: 'The triumph and tenacity of Murlikant Petkar, an Indian soldier who miraculously survived nine bullet wounds to become India’s very first Paralympic gold medalist.',
    genres: ['Biography', 'Drama', 'Sports'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 143,
    releaseDate: '2026-08-20',
    certificate: 'U',
    rating: 8.6,
    votes: 110000,
    director: 'Kabir Khan',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Kartik Aaryan', role: 'Murlikant Petkar', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Vijay Raaz', role: 'Coach Tiger Ali', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Bhuvan Arora', role: 'Garnail Singh', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Yashpal Sharma', role: 'Subedar Uttam Singh', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
    ],
  },
  {
    title: 'Bad Newz',
    slug: 'bad-newz',
    description: 'A hilarious medical rarity known as heteropaternal superfecundation creates chaotic romantic rivalry when two men discover they fathered twins with one woman.',
    genres: ['Comedy', 'Romance'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 142,
    releaseDate: '2026-09-02',
    certificate: 'UA',
    rating: 7.2,
    votes: 68000,
    director: 'Anand Tiwari',
    status: 'now_showing',
    theme: 'amber',
    cast: [
      { name: 'Vicky Kaushal', role: 'Akhil Chadha', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Triptii Dimri', role: 'Saloni Bagga', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Ammy Virk', role: 'Gurbir Pannu', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Neha Dhupia', role: 'Dr. Baweja', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Raayan',
    slug: 'raayan',
    description: 'A modest fast-food cook in North Chennai who strives to shield his younger siblings gets dragged into ruthless gang warfare when his brother commits murder.',
    genres: ['Action', 'Crime', 'Drama'],
    languages: ['Tamil', 'Telugu', 'Hindi'],
    formats: ['2D'],
    durationMin: 145,
    releaseDate: '2026-09-04',
    certificate: 'A',
    rating: 8.2,
    votes: 118000,
    director: 'Dhanush',
    status: 'now_showing',
    theme: 'blood',
    cast: [
      { name: 'Dhanush', role: 'Kathavaraayan / Raayan', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'S.J. Suryah', role: 'Sethuraman', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Sundeep Kishan', role: 'Muthuvelraayan', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Dushara Vijayan', role: 'Durga', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Stree 2: Sarkate Ka Aatank',
    slug: 'stree-2-sarkate-ka-aatank',
    description: 'The eccentric residents of Chanderi unite once more alongside the benevolent spirit Stree to battle a terrifying headless phantom who abducts progressive women.',
    genres: ['Comedy', 'Horror'],
    languages: ['Hindi'],
    formats: ['2D', '3D', 'IMAX'],
    durationMin: 147,
    releaseDate: '2026-09-15',
    certificate: 'UA',
    rating: 8.7,
    votes: 265000,
    director: 'Amar Kaushik',
    status: 'now_showing',
    theme: 'noir',
    cast: [
      { name: 'Rajkummar Rao', role: 'Vicky', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Shraddha Kapoor', role: 'The Unknown Maiden', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Pankaj Tripathi', role: 'Rudra Bhaiya', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Abhishek Banerjee', role: 'Jana', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Khel Khel Mein',
    slug: 'khel-khel-mein',
    description: 'During a festive wedding weekend, seven long-time friends play a dangerous dinner game where all incoming phone calls and text messages must be publicly shared.',
    genres: ['Comedy', 'Drama'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 134,
    releaseDate: '2026-09-08',
    certificate: 'UA',
    rating: 7.5,
    votes: 72000,
    director: 'Mudassar Aziz',
    status: 'now_showing',
    theme: 'sunset',
    cast: [
      { name: 'Akshay Kumar', role: 'Rishabh Malik', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Taapsee Pannu', role: 'Happy Kaur', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Fardeen Khan', role: 'Kabir Deshmukh', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Vaani Kapoor', role: 'Vartika Malik', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Devara: Part 1',
    slug: 'devara-part-1',
    description: 'In an isolated coastal realm governed by sea marauders, a noble guardian refuses to let his people be exploited as weapon smugglers, sparking generational rebellion.',
    genres: ['Action', 'Drama', 'Thriller'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 178,
    releaseDate: '2026-09-27',
    certificate: 'UA',
    rating: 8.4,
    votes: 210000,
    director: 'Koratala Siva',
    status: 'now_showing',
    theme: 'cosmic',
    cast: [
      { name: 'Jr NTR', role: 'Devara / Vara', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Saif Ali Khan', role: 'Bhaira', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Janhvi Kapoor', role: 'Thangam', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Prakash Raj', role: 'Singappa', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    ],
  },
  {
    title: 'Jigra',
    slug: 'jigra',
    description: 'An undaunted sister risks everything and orchestrates a desperate, meticulously planned maximum-security prison break in a foreign country to save her brother.',
    genres: ['Action', 'Drama', 'Thriller'],
    languages: ['Hindi', 'Telugu'],
    formats: ['2D', 'IMAX'],
    durationMin: 153,
    releaseDate: '2026-10-11',
    certificate: 'UA',
    rating: 8.0,
    votes: 88000,
    director: 'Vasan Bala',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Alia Bhatt', role: 'Satya Anand', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Vedang Raina', role: 'Ankur Anand', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Manoj Pahwa', role: 'Bhatia Ji', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Rahul Ravindran', role: 'Muthu', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Vettaiyan',
    slug: 'vettaiyan',
    description: 'A celebrated encounter specialist officer grapples with the morality of vigilante justice after a public shooting exposes systemic corporate bribery.',
    genres: ['Action', 'Drama'],
    languages: ['Tamil', 'Telugu', 'Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 163,
    releaseDate: '2026-10-10',
    certificate: 'UA',
    rating: 8.1,
    votes: 142000,
    director: 'T.J. Gnanavel',
    status: 'now_showing',
    theme: 'emerald',
    cast: [
      { name: 'Rajinikanth', role: 'SP Athiyan', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Amitabh Bachchan', role: 'Justice Sathyadev', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Fahadh Faasil', role: 'Patrick', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Manju Warrier', role: 'Thara Athiyan', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Deadpool & Wolverine',
    slug: 'deadpool-and-wolverine',
    description: 'A listless Wade Wilson is pulled into the Time Variance Authority to save his home universe, teaming up with a crestfallen, alternate-timeline Wolverine.',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['2D', '3D', 'IMAX', '4DX'],
    durationMin: 128,
    releaseDate: '2026-09-20',
    certificate: 'A',
    rating: 8.9,
    votes: 420000,
    director: 'Shawn Levy',
    status: 'now_showing',
    theme: 'fire',
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Emma Corrin', role: 'Cassandra Nova', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Matthew Macfadyen', role: 'Mr. Paradox', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },

  // --- 12 COMING SOON ---
  {
    title: 'Singham Again',
    slug: 'singham-again',
    description: 'Bajirao Singham marshals an elite brigade of cop universe heroes to rescue his abducted wife in a thunderous cross-border campaign inspired by the Ramayana.',
    genres: ['Action', 'Drama'],
    languages: ['Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 155,
    releaseDate: '2026-11-01',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'Rohit Shetty',
    status: 'coming_soon',
    theme: 'fire',
    cast: [
      { name: 'Ajay Devgn', role: 'DCP Bajirao Singham', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Kareena Kapoor Khan', role: 'Avni Kamat Singham', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Ranveer Singh', role: 'Sangram Bhalerao Simmba', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Deepika Padukone', role: 'SP Shakti Shetty', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Bhool Bhulaiyaa 3',
    slug: 'bhool-bhulaiyaa-3',
    description: 'Rooh Baba journeys to a royal estate in Bengal to debunk a sinister royal curse, only to unleash twin spirits claiming to be the authentic vengeful Manjulika.',
    genres: ['Comedy', 'Horror'],
    languages: ['Hindi'],
    formats: ['2D'],
    durationMin: 150,
    releaseDate: '2026-11-01',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'Anees Bazmee',
    status: 'coming_soon',
    theme: 'noir',
    cast: [
      { name: 'Kartik Aaryan', role: 'Ruhan Randhawa / Rooh Baba', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Vidya Balan', role: 'Manjulika', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Madhuri Dixit', role: 'Mandira', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Triptii Dimri', role: 'Meera', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
    ],
  },
  {
    title: 'Kanguva',
    slug: 'kanguva',
    description: 'A dual-timeline mythic fantasy bridging a fierce medieval tribal chieftain’s sacrifice with a contemporary bounty hunter’s unresolved cosmic destiny.',
    genres: ['Action', 'Fantasy'],
    languages: ['Tamil', 'Telugu', 'Hindi', 'Malayalam'],
    formats: ['2D', '3D', 'IMAX'],
    durationMin: 160,
    releaseDate: '2026-11-14',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'Siva',
    status: 'coming_soon',
    theme: 'fire',
    cast: [
      { name: 'Suriya', role: 'Kanguva / Francis', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Bobby Deol', role: 'Udhiran', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Disha Patani', role: 'Angela', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Jagapathi Babu', role: 'Clan Elder', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'Gladiator II',
    slug: 'gladiator-ii',
    description: 'Years after Maximus’s death, Lucius is captured from his peaceful home and forced into the Colosseum, seeking vengeance to restore glory to Rome.',
    genres: ['Action', 'Adventure', 'Drama'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 148,
    releaseDate: '2026-11-15',
    certificate: 'A',
    rating: null,
    votes: 0,
    director: 'Ridley Scott',
    status: 'coming_soon',
    theme: 'amber',
    cast: [
      { name: 'Paul Mescal', role: 'Lucius Verus', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Pedro Pascal', role: 'Marcus Acacius', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Denzel Washington', role: 'Macrinus', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Connie Nielsen', role: 'Lucilla', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Pushpa 2: The Rule',
    slug: 'pushpa-2-the-rule',
    description: 'Pushpa Raj expands his red sandalwood empire into an unassailable international syndicate, confronting ruthless police chief Bhanwar Singh Shekhawat.',
    genres: ['Action', 'Crime', 'Drama'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 185,
    releaseDate: '2026-12-05',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'Sukumar',
    status: 'coming_soon',
    theme: 'blood',
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh Shekhawat', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Jagadeesh Prathap Bandari', role: 'Kesava', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
  {
    title: 'Baby John',
    slug: 'baby-john',
    description: 'An erstwhile celebrated police commissioner fakes his death to raise his daughter in solitude until ruthless underworld lords uncover his whereabouts.',
    genres: ['Action', 'Thriller'],
    languages: ['Hindi', 'Tamil'],
    formats: ['2D'],
    durationMin: 145,
    releaseDate: '2026-12-25',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'A. Kaleeswaran',
    status: 'coming_soon',
    theme: 'fire',
    cast: [
      { name: 'Varun Dhawan', role: 'Baby John / DCP Satya', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Keerthy Suresh', role: 'Rhea', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Wamiqa Gabbi', role: 'Tara', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Jackie Shroff', role: 'Babbar Sher', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'Game Changer',
    slug: 'game-changer',
    description: 'An uncompromising Indian Administrative Service officer launches a relentless, brilliant crusade to reform corrupt electoral politics and fair governance.',
    genres: ['Action', 'Drama'],
    languages: ['Telugu', 'Hindi', 'Tamil'],
    formats: ['2D', 'IMAX'],
    durationMin: 165,
    releaseDate: '2027-01-10',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'S. Shankar',
    status: 'coming_soon',
    theme: 'cyber',
    cast: [
      { name: 'Ram Charan', role: 'Ram Nandan IAS', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Kiara Advani', role: 'Deepika', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'S.J. Suryah', role: 'Bommali', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Anjali', role: 'Parvathi', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    ],
  },
  {
    title: 'Avatar: Fire and Ash',
    slug: 'avatar-fire-and-ash',
    description: 'Jake Sully and Neytiri encounter the Ash People, an aggressive volcanic clan of Na’vi who challenge Pandora’s fragile ecological harmony.',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['2D', '3D', 'IMAX', '4DX'],
    durationMin: 190,
    releaseDate: '2027-12-18',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'James Cameron',
    status: 'coming_soon',
    theme: 'cosmic',
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Zoe Saldana', role: 'Neytiri', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Sigourney Weaver', role: 'Kiri', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
      { name: 'Stephen Lang', role: 'Miles Quaritch', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'The Batman: Part II',
    slug: 'the-batman-part-ii',
    description: 'As Gotham City fights to rebuild following the great flood, Bruce Wayne penetrates the corrupted underbelly of the Court of Owls.',
    genres: ['Action', 'Crime', 'Mystery'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX'],
    durationMin: 170,
    releaseDate: '2027-10-02',
    certificate: 'A',
    rating: null,
    votes: 0,
    director: 'Matt Reeves',
    status: 'coming_soon',
    theme: 'noir',
    cast: [
      { name: 'Robert Pattinson', role: 'Bruce Wayne / Batman', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Colin Farrell', role: 'Oswald Cobblepot / Penguin', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Andy Serkis', role: 'Alfred Pennyworth', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Jeffrey Wright', role: 'Lt. James Gordon', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    ],
  },
  {
    title: 'Ramayana: Part 1',
    slug: 'ramayana-part-1',
    description: 'The definitive cinematic adaptation of India’s timeless epic, tracking Prince Rama’s exile, devotion, and the momentous events leading up to the war against Lanka.',
    genres: ['Action', 'Drama', 'Fantasy'],
    languages: ['Hindi', 'Telugu', 'Tamil', 'Kannada'],
    formats: ['2D', '3D', 'IMAX'],
    durationMin: 180,
    releaseDate: '2027-10-20',
    certificate: 'U',
    rating: null,
    votes: 0,
    director: 'Nitesh Tiwari',
    status: 'coming_soon',
    theme: 'amber',
    cast: [
      { name: 'Ranbir Kapoor', role: 'Lord Rama', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Sai Pallavi', role: 'Goddess Sita', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Yash', role: 'Ravana', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Sunny Deol', role: 'Lord Hanuman', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'War 2',
    slug: 'war-2',
    description: 'RAW’s most lethal operative Major Kabir Dhaliwal confronts a rogue tactical mastermind in a globe-trotting spy thriller across Japan, Italy, and India.',
    genres: ['Action', 'Thriller'],
    languages: ['Hindi', 'Telugu', 'Tamil'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 160,
    releaseDate: '2027-08-14',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'Ayan Mukerji',
    status: 'coming_soon',
    theme: 'fire',
    cast: [
      { name: 'Hrithik Roshan', role: 'Major Kabir Dhaliwal', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Jr NTR', role: 'Vikram', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Kiara Advani', role: 'Agent Maya', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Ashutosh Rana', role: 'Colonel Luthra', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    ],
  },
  {
    title: 'Mission: Impossible - The Final Reckoning',
    slug: 'mission-impossible-the-final-reckoning',
    description: 'Ethan Hunt and his IMF team face their ultimate endgame against the omnipotent rogue AI Entity, risking everything to prevent global catastrophe.',
    genres: ['Action', 'Thriller'],
    languages: ['English', 'Hindi'],
    formats: ['2D', 'IMAX', '4DX'],
    durationMin: 165,
    releaseDate: '2027-05-21',
    certificate: 'UA',
    rating: null,
    votes: 0,
    director: 'Christopher McQuarrie',
    status: 'coming_soon',
    theme: 'cyber',
    cast: [
      { name: 'Tom Cruise', role: 'Ethan Hunt', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Hayley Atwell', role: 'Grace', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Ving Rhames', role: 'Luther Stickell', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
      { name: 'Simon Pegg', role: 'Benji Dunn', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    ],
  },
];

// Color Palettes for themes
const THEMES = {
  fire: {
    bg1: '#140303',
    bg2: '#380a0a',
    bg3: '#080101',
    accent: '#f84464',
    secondary: '#ff9800',
    glow: '#e50914',
    icon: 'flame',
  },
  blood: {
    bg1: '#120407',
    bg2: '#2c0b13',
    bg3: '#070103',
    accent: '#e50914',
    secondary: '#ff4d6d',
    glow: '#d90429',
    icon: 'shield',
  },
  cyber: {
    bg1: '#020b18',
    bg2: '#0b2545',
    bg3: '#01050c',
    accent: '#00d2ff',
    secondary: '#3a7bd5',
    glow: '#00f2fe',
    icon: 'radar',
  },
  cosmic: {
    bg1: '#0a0316',
    bg2: '#21093f',
    bg3: '#040108',
    accent: '#c77dff',
    secondary: '#7b2cbf',
    glow: '#9d4edd',
    icon: 'planet',
  },
  amber: {
    bg1: '#170c02',
    bg2: '#381e05',
    bg3: '#0a0501',
    accent: '#ffb703',
    secondary: '#fb8500',
    glow: '#f77f00',
    icon: 'sun',
  },
  sunset: {
    bg1: '#180714',
    bg2: '#3b1233',
    bg3: '#0a0208',
    accent: '#ff4b8b',
    secondary: '#f39c12',
    glow: '#e83e8c',
    icon: 'spark',
  },
  emerald: {
    bg1: '#02140d',
    bg2: '#082f20',
    bg3: '#010a06',
    accent: '#06d6a0',
    secondary: '#118ab2',
    glow: '#05b084',
    icon: 'compass',
  },
  noir: {
    bg1: '#0b0c10',
    bg2: '#1f2833',
    bg3: '#050608',
    accent: '#e50914',
    secondary: '#66fcf1',
    glow: '#c5a880',
    icon: 'mask',
  },
};

const getThemeIcon = (iconType, accent, secondary) => {
  switch (iconType) {
    case 'flame':
      return `
        <path d="M0 -70 C20 -40, 50 -20, 35 30 C20 70, -30 70, -35 25 C-40 -15, -10 -40, 0 -70 Z" fill="url(#artGlow)" opacity="0.9" />
        <path d="M0 -30 C10 -10, 25 5, 18 35 C10 55, -15 55, -18 30 C-20 10, -5 -10, 0 -30 Z" fill="${secondary}" opacity="0.8" />
        <circle cx="0" cy="15" r="14" fill="#ffffff" opacity="0.9" />
      `;
    case 'planet':
      return `
        <circle cx="0" cy="0" r="50" fill="url(#artGlow)" />
        <ellipse cx="0" cy="0" rx="90" ry="24" fill="none" stroke="${accent}" stroke-width="6" opacity="0.85" transform="rotate(-25)" />
        <circle cx="-15" cy="-15" r="10" fill="#ffffff" opacity="0.4" />
      `;
    case 'radar':
      return `
        <circle cx="0" cy="0" r="60" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="6,6" opacity="0.6" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="${secondary}" stroke-width="4" opacity="0.8" />
        <circle cx="0" cy="0" r="20" fill="url(#artGlow)" />
        <line x1="-70" y1="0" x2="70" y2="0" stroke="${accent}" stroke-width="2" opacity="0.5" />
        <line x1="0" y1="-70" x2="0" y2="70" stroke="${accent}" stroke-width="2" opacity="0.5" />
      `;
    case 'shield':
      return `
        <path d="M0 -65 L50 -35 L45 25 C40 60, 0 80, 0 80 C0 80, -40 60, -45 25 L-50 -35 Z" fill="url(#artGlow)" opacity="0.9" />
        <path d="M0 -45 L35 -20 L30 20 C25 45, 0 60, 0 60 C0 60, -25 45, -30 20 L-35 -20 Z" fill="${secondary}" opacity="0.75" />
        <circle cx="0" cy="5" r="16" fill="#ffffff" opacity="0.95" />
      `;
    case 'sun':
      return `
        <circle cx="0" cy="0" r="45" fill="url(#artGlow)" />
        <g stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity="0.8">
          <line x1="0" y1="-65" x2="0" y2="-55" />
          <line x1="0" y1="55" x2="0" y2="65" />
          <line x1="-65" y1="0" x2="-55" y2="0" />
          <line x1="55" y1="0" x2="65" y2="0" />
          <line x1="-45" y1="-45" x2="-38" y2="-38" />
          <line x1="38" y1="38" x2="45" y2="45" />
          <line x1="45" y1="-45" x2="38" y2="-38" />
          <line x1="-38" y1="38" x2="-45" y2="45" />
        </g>
      `;
    case 'spark':
      return `
        <path d="M0 -70 Q5 -15 60 0 Q5 15 0 70 Q-5 15 -60 0 Q-5 -15 0 -70 Z" fill="url(#artGlow)" />
        <circle cx="0" cy="0" r="16" fill="#ffffff" />
      `;
    case 'compass':
      return `
        <circle cx="0" cy="0" r="55" fill="none" stroke="${accent}" stroke-width="4" opacity="0.8" />
        <polygon points="0,-50 14,0 0,50 -14,0" fill="url(#artGlow)" />
        <polygon points="0,-50 0,50 14,0" fill="${secondary}" opacity="0.6" />
        <circle cx="0" cy="0" r="8" fill="#ffffff" />
      `;
    default: // mask / classic
      return `
        <circle cx="0" cy="0" r="50" fill="url(#artGlow)" />
        <ellipse cx="-18" cy="-10" rx="10" ry="14" fill="#0b0c10" />
        <ellipse cx="18" cy="-10" rx="10" ry="14" fill="#0b0c10" />
        <path d="M-22 18 Q0 36 22 18" stroke="#0b0c10" stroke-width="6" fill="none" stroke-linecap="round" />
      `;
  }
};

const escapeXml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Generate 600x900 Vertical Poster SVG
const generateVerticalPoster = (m) => {
  const t = THEMES[m.theme] || THEMES.fire;
  const isNowShowing = m.status === 'now_showing';
  const primaryGenre = m.genres[0] || 'Cinema';
  const secondaryGenre = m.genres[1] || '';
  const formatsStr = m.formats.slice(0, 2).join(' • ');

  // Split title if long
  let titleLine1 = m.title;
  let titleLine2 = '';
  if (m.title.length > 18 && m.title.includes(':')) {
    const parts = m.title.split(':');
    titleLine1 = parts[0].trim();
    titleLine2 = parts.slice(1).join(':').trim();
  } else if (m.title.length > 20 && m.title.includes(' - ')) {
    const parts = m.title.split(' - ');
    titleLine1 = parts[0].trim();
    titleLine2 = parts.slice(1).join(' - ').trim();
  } else if (m.title.length > 22 && m.title.includes(' ')) {
    const words = m.title.split(' ');
    const mid = Math.ceil(words.length / 2);
    titleLine1 = words.slice(0, mid).join(' ');
    titleLine2 = words.slice(mid).join(' ');
  }

  const ratingBadge = isNowShowing
    ? `<rect x="50" y="700" width="165" height="42" rx="8" fill="#e50914" />
       <text x="65" y="728" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, sans-serif">★ ${m.rating} / 10</text>
       <text x="225" y="726" fill="#cccccc" font-size="14" font-weight="600" font-family="system-ui, sans-serif">${(m.votes / 1000).toFixed(0)}k+ votes</text>`
    : `<rect x="50" y="700" width="230" height="42" rx="8" fill="#f59e0b" />
       <text x="65" y="727" fill="#000000" font-size="16" font-weight="900" font-family="system-ui, sans-serif">RELEASING SOON</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${t.bg2}" />
      <stop offset="35%" stop-color="${t.bg1}" />
      <stop offset="75%" stop-color="${t.bg3}" />
      <stop offset="100%" stop-color="#020202" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${t.glow}" stop-opacity="0.5" />
      <stop offset="60%" stop-color="${t.bg2}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="artGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.accent}" />
      <stop offset="100%" stop-color="${t.secondary}" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="600" height="900" fill="url(#bgGrad)" />
  <circle cx="300" cy="380" r="280" fill="url(#centerGlow)" />

  <!-- Geometric Frame Lines -->
  <rect x="25" y="25" width="550" height="850" rx="16" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.12" />
  <rect x="35" y="35" width="530" height="830" rx="12" fill="none" stroke="${t.accent}" stroke-width="1" stroke-opacity="0.2" />

  <!-- Top Bar: Brand, Certificate, Formats -->
  <g transform="translate(50, 65)">
    <!-- Certificate Pill -->
    <rect x="0" y="0" width="46" height="28" rx="6" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-width="1" stroke-opacity="0.3" />
    <text x="23" y="19" fill="#ffffff" font-size="14" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">${escapeXml(m.certificate)}</text>

    <!-- Language / Format -->
    <rect x="56" y="0" width="90" height="28" rx="6" fill="${t.accent}" fill-opacity="0.2" stroke="${t.accent}" stroke-width="1" stroke-opacity="0.5" />
    <text x="101" y="19" fill="${t.accent}" font-size="12" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">${escapeXml(formatsStr)}</text>

    <!-- Runtime -->
    <text x="500" y="19" fill="#aaaaaa" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="end">${m.durationMin} MINS</text>
  </g>

  <!-- Central Stylized Cinema Artwork -->
  <g transform="translate(300, 360) scale(1.6)" filter="url(#shadow)">
    ${getThemeIcon(t.icon, t.accent, t.secondary)}
  </g>

  <!-- Decorative Cinema Lens Rings -->
  <circle cx="300" cy="360" r="170" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.06" stroke-dasharray="4,8" />
  <circle cx="300" cy="360" r="210" fill="none" stroke="${t.accent}" stroke-width="1" stroke-opacity="0.08" />

  <!-- Movie Title Block -->
  <g transform="translate(50, 600)" filter="url(#shadow)">
    <text x="0" y="0" fill="#ffffff" font-size="${titleLine2 ? 34 : 40}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" letter-spacing="0.5">${escapeXml(titleLine1.toUpperCase())}</text>
    ${titleLine2 ? `<text x="0" y="38" fill="${t.accent}" font-size="28" font-weight="900" font-family="system-ui, -apple-system, sans-serif" letter-spacing="0.5">${escapeXml(titleLine2.toUpperCase())}</text>` : ''}
  </g>

  <!-- Genre & Languages -->
  <g transform="translate(50, 665)">
    <text x="0" y="0" fill="#e0e0e0" font-size="14" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="1">
      ${escapeXml(m.genres.slice(0, 3).join(' • ').toUpperCase())}
    </text>
    <text x="500" y="0" fill="#999999" font-size="13" font-weight="600" font-family="system-ui, sans-serif" text-anchor="end">
      ${escapeXml(m.languages.slice(0, 2).join(', '))}
    </text>
  </g>

  <!-- Rating Badge or Coming Soon Pill -->
  ${ratingBadge}

  <!-- Director & Cast Credit Line -->
  <g transform="translate(50, 775)">
    <text x="0" y="0" fill="#888888" font-size="12" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="0.5">DIRECTED BY ${escapeXml(m.director.toUpperCase())}</text>
    <text x="0" y="20" fill="#bbbbbb" font-size="12" font-weight="500" font-family="system-ui, sans-serif">Starring: ${escapeXml(m.cast.map(c => c.name).slice(0, 3).join(', '))}</text>
  </g>

  <!-- Bottom CTA Banner -->
  <rect x="25" y="825" width="550" height="50" rx="10" fill="#111111" fill-opacity="0.7" stroke="#ffffff" stroke-width="1" stroke-opacity="0.08" />
  <text x="300" y="856" fill="#ffffff" font-size="13" font-weight="800" font-family="system-ui, sans-serif" letter-spacing="2.5" text-anchor="middle">
    BOOK TICKETS ON SHOWTIME • ONLY IN CINEMAS
  </text>
</svg>`;
};

// Generate 1280x720 Horizontal Backdrop SVG
const generateBackdropPoster = (m) => {
  const t = THEMES[m.theme] || THEMES.fire;
  const isNowShowing = m.status === 'now_showing';
  const genresStr = m.genres.join(' • ');
  const formatsStr = m.formats.join(' • ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bgWide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg3}" />
      <stop offset="45%" stop-color="${t.bg2}" />
      <stop offset="100%" stop-color="${t.bg1}" />
    </linearGradient>
    <radialGradient id="wideGlow" cx="75%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${t.glow}" stop-opacity="0.5" />
      <stop offset="70%" stop-color="${t.bg2}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#050505" stop-opacity="0.95" />
      <stop offset="40%" stop-color="#050505" stop-opacity="0.8" />
      <stop offset="75%" stop-color="#050505" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#050505" stop-opacity="0.1" />
    </linearGradient>
    <linearGradient id="artWide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.accent}" />
      <stop offset="100%" stop-color="${t.secondary}" />
    </linearGradient>
    <filter id="wideShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="720" fill="url(#bgWide)" />
  <rect width="1280" height="720" fill="url(#wideGlow)" />

  <!-- Right Hero Artwork Visual -->
  <g transform="translate(920, 360) scale(2.6)" filter="url(#wideShadow)">
    ${getThemeIcon(t.icon, t.accent, t.secondary)}
  </g>
  <circle cx="920" cy="360" r="280" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.08" stroke-dasharray="8,12" />
  <circle cx="920" cy="360" r="340" fill="none" stroke="${t.accent}" stroke-width="1" stroke-opacity="0.1" />

  <!-- Left Dark Fade for Detail Page Text Overlay -->
  <rect width="1280" height="720" fill="url(#fadeLeft)" />

  <!-- Content Block on Left -->
  <g transform="translate(80, 150)" filter="url(#wideShadow)">
    <!-- Certificate and Formats -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="50" height="30" rx="6" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="1" stroke-opacity="0.4" />
      <text x="25" y="21" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">${escapeXml(m.certificate)}</text>

      <rect x="62" y="0" width="130" height="30" rx="6" fill="${t.accent}" fill-opacity="0.2" stroke="${t.accent}" stroke-width="1" stroke-opacity="0.5" />
      <text x="127" y="20" fill="${t.accent}" font-size="13" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">${escapeXml(formatsStr)}</text>

      <text x="210" y="21" fill="#aaaaaa" font-size="15" font-weight="700" font-family="system-ui, sans-serif">${m.durationMin} MINS • ${escapeXml(m.languages.join(', '))}</text>
    </g>

    <!-- Main Title -->
    <text x="0" y="90" fill="#ffffff" font-size="52" font-weight="900" font-family="system-ui, -apple-system, sans-serif" letter-spacing="0.5">${escapeXml(m.title.toUpperCase())}</text>

    <!-- Genres -->
    <text x="0" y="145" fill="${t.accent}" font-size="18" font-weight="800" font-family="system-ui, sans-serif" letter-spacing="1.5">${escapeXml(genresStr.toUpperCase())}</text>

    <!-- Description synopsis -->
    <foreignObject x="0" y="170" width="620" height="110">
      <p xmlns="http://www.w3.org/1999/xhtml" style="color: #cccccc; font-family: system-ui, sans-serif; font-size: 16px; line-height: 1.5; margin: 0;">
        ${escapeXml(m.description)}
      </p>
    </foreignObject>

    <!-- Rating / Release Bar -->
    <g transform="translate(0, 310)">
      ${isNowShowing ? `
        <rect x="0" y="0" width="180" height="46" rx="8" fill="#e50914" />
        <text x="90" y="30" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">★ ${m.rating} / 10</text>
        <text x="200" y="30" fill="#cccccc" font-size="16" font-weight="600" font-family="system-ui, sans-serif">${(m.votes / 1000).toFixed(0)}k+ reviews on ShowTime</text>
      ` : `
        <rect x="0" y="0" width="220" height="46" rx="8" fill="#f59e0b" />
        <text x="110" y="30" fill="#000000" font-size="18" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">COMING SOON</text>
        <text x="240" y="30" fill="#cccccc" font-size="16" font-weight="600" font-family="system-ui, sans-serif">Releasing ${m.releaseDate}</text>
      `}
    </g>

    <!-- Credits -->
    <g transform="translate(0, 400)">
      <text x="0" y="0" fill="#888888" font-size="14" font-weight="700" font-family="system-ui, sans-serif">DIRECTED BY: <tspan fill="#ffffff">${escapeXml(m.director)}</tspan></text>
      <text x="0" y="26" fill="#888888" font-size="14" font-weight="700" font-family="system-ui, sans-serif">CAST: <tspan fill="#dddddd">${escapeXml(m.cast.map(c => c.name).join(', '))}</tspan></text>
    </g>
  </g>
</svg>`;
};

// 1. Write all 100 SVGs to frontend/vite-project/public/posters/
console.log(`\n--- Generating 100 SVGs for 50 Movies in ${postersDir} ---`);
for (const m of rawMovies) {
  const vPosterPath = path.join(postersDir, `${m.slug}.svg`);
  const wPosterPath = path.join(postersDir, `${m.slug}-wide.svg`);

  fs.writeFileSync(vPosterPath, generateVerticalPoster(m), 'utf8');
  fs.writeFileSync(wPosterPath, generateBackdropPoster(m), 'utf8');
}
console.log(`✓ Successfully generated 50 vertical and 50 wide SVG posters!`);

// 2. Format movies data for backend/seed/data/movies.js
const formattedMoviesCode = `/**
 * Seed Data: 50 Curated Movies Catalog (Spec B9, Phase 3)
 * 38 Now Showing, 12 Coming Soon
 * Featuring local SVG posters at /posters/{slug}.svg and {slug}-wide.svg
 */

import { MOVIE_STATUSES } from '../../config/constants.js';

export const moviesData = ${JSON.stringify(
  rawMovies.map((m) => ({
    title: m.title,
    description: m.description,
    genres: m.genres,
    languages: m.languages,
    formats: m.formats,
    durationMin: m.durationMin,
    releaseDate: m.releaseDate,
    certificate: m.certificate,
    posterUrl: `/posters/${m.slug}.svg`,
    posterPublicId: `showtime/posters/${m.slug}`,
    backdropUrl: `/posters/${m.slug}-wide.svg`,
    backdropPublicId: `showtime/backdrops/${m.slug}`,
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: m.rating,
    votes: m.votes,
    director: m.director,
    cast: m.cast,
    status: m.status === 'now_showing' ? 'now_showing' : 'coming_soon',
  })),
  null,
  2
).replace(/"releaseDate": "([^"]+)"/g, '"releaseDate": new Date("$1")')
 .replace(/"status": "now_showing"/g, 'status: MOVIE_STATUSES.NOW_SHOWING')
 .replace(/"status": "coming_soon"/g, 'status: MOVIE_STATUSES.COMING_SOON')};

export default moviesData;
`;

fs.writeFileSync(moviesDataFile, formattedMoviesCode, 'utf8');
console.log(`✓ Successfully updated ${moviesDataFile} with 50 movies!`);
