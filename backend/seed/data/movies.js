/**
 * Seed Data: 50 Curated Movies Catalog (Spec B9, Phase 3)
 * 38 Now Showing, 12 Coming Soon
 * Featuring local SVG posters at /posters/{slug}.svg and {slug}-wide.svg
 */

import { MOVIE_STATUSES } from '../../config/constants.js';

export const moviesData = [
  {
    "title": "Jawan: Extended Cut",
    "description": "A high-octane emotional journey of a prison warden driven by a deep personal vendetta to rectify the wrongs in society while keeping a promise made years ago.",
    "genres": [
      "Action",
      "Thriller"
    ],
    "languages": [
      "Hindi",
      "Tamil",
      "Telugu"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 169,
    "releaseDate": new Date("2026-09-07"),
    "certificate": "UA",
    "posterUrl": "/posters/jawan-extended-cut.svg",
    "posterPublicId": "showtime/posters/jawan-extended-cut",
    "backdropUrl": "/posters/jawan-extended-cut-wide.svg",
    "backdropPublicId": "showtime/backdrops/jawan-extended-cut",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.8,
    "votes": 218500,
    "director": "Atlee",
    "cast": [
      {
        "name": "Shah Rukh Khan",
        "role": "Vikram & Azad Rathore",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Nayanthara",
        "role": "Narmada Rai",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Vijay Sethupathi",
        "role": "Kaleeshwaran",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Deepika Padukone",
        "role": "Aishwarya Rathore",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Salaar: Part 1 - Ceasefire",
    "description": "In the lawless walled city of Khansaar, a hardened commander vows to protect his exiled childhood friend who returns to reclaim his rightful crown.",
    "genres": [
      "Action",
      "Crime",
      "Drama"
    ],
    "languages": [
      "Telugu",
      "Hindi",
      "Kannada",
      "Tamil"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 175,
    "releaseDate": new Date("2026-08-25"),
    "certificate": "A",
    "posterUrl": "/posters/salaar-part-1-ceasefire.svg",
    "posterPublicId": "showtime/posters/salaar-part-1-ceasefire",
    "backdropUrl": "/posters/salaar-part-1-ceasefire-wide.svg",
    "backdropPublicId": "showtime/backdrops/salaar-part-1-ceasefire",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.3,
    "votes": 182400,
    "director": "Prashanth Neel",
    "cast": [
      {
        "name": "Prabhas",
        "role": "Deva / Salaar",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Prithviraj Sukumaran",
        "role": "Varadharaja Mannaar",
        "imageUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80"
      },
      {
        "name": "Shruti Haasan",
        "role": "Aadya",
        "imageUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80"
      },
      {
        "name": "Jagapathi Babu",
        "role": "Raja Mannaar",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Fighter",
    "description": "Top Air Force aviators come together to form Air Dragons, confronting perilous international airspace skirmishes while dealing with interpersonal turmoil.",
    "genres": [
      "Action",
      "Thriller"
    ],
    "languages": [
      "Hindi",
      "English"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 166,
    "releaseDate": new Date("2026-09-18"),
    "certificate": "UA",
    "posterUrl": "/posters/fighter.svg",
    "posterPublicId": "showtime/posters/fighter",
    "backdropUrl": "/posters/fighter-wide.svg",
    "backdropPublicId": "showtime/backdrops/fighter",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.2,
    "votes": 145000,
    "director": "Siddharth Anand",
    "cast": [
      {
        "name": "Hrithik Roshan",
        "role": "Sq Leader Shamsher Pathania",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Deepika Padukone",
        "role": "Sq Leader Minal Rathore",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Anil Kapoor",
        "role": "Gp Capt Rakesh Jai Singh",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Karan Singh Grover",
        "role": "Sq Leader Sartaj Gill",
        "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Kalki 2898 AD",
    "description": "Set in a post-apocalyptic desert metropolis in the year 2898 AD, an ancient warrior awakened across millennia fights to protect the unborn vessel of divine hope.",
    "genres": [
      "Sci-Fi",
      "Action",
      "Fantasy"
    ],
    "languages": [
      "Telugu",
      "Hindi",
      "Tamil",
      "Malayalam"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 181,
    "releaseDate": new Date("2026-09-22"),
    "certificate": "UA",
    "posterUrl": "/posters/kalki-2898-ad.svg",
    "posterPublicId": "showtime/posters/kalki-2898-ad",
    "backdropUrl": "/posters/kalki-2898-ad-wide.svg",
    "backdropPublicId": "showtime/backdrops/kalki-2898-ad",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.9,
    "votes": 312000,
    "director": "Nag Ashwin",
    "cast": [
      {
        "name": "Prabhas",
        "role": "Bhairava",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Amitabh Bachchan",
        "role": "Ashwatthama",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Kamal Haasan",
        "role": "Supreme Yaskin",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Deepika Padukone",
        "role": "SUM-80",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Dunki",
    "description": "Four small-town friends embark on a daring, heartwarming odyssey across continents through the perilous backdoor migrant route, seeking a better tomorrow.",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "languages": [
      "Hindi",
      "English"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 160,
    "releaseDate": new Date("2026-08-14"),
    "certificate": "U",
    "posterUrl": "/posters/dunki.svg",
    "posterPublicId": "showtime/posters/dunki",
    "backdropUrl": "/posters/dunki-wide.svg",
    "backdropPublicId": "showtime/backdrops/dunki",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.9,
    "votes": 98000,
    "director": "Rajkumar Hirani",
    "cast": [
      {
        "name": "Shah Rukh Khan",
        "role": "Hardayal Hardy Singh",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Taapsee Pannu",
        "role": "Manu Randhawa",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Boman Irani",
        "role": "Geetu Gulati",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Vicky Kaushal",
        "role": "Sukhi",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Animal",
    "description": "A transformative, turbulent drama about the fierce, obsessive bond between a tycoon father and his volatile son who spirals into bloody vengeance.",
    "genres": [
      "Action",
      "Crime",
      "Drama"
    ],
    "languages": [
      "Hindi",
      "Telugu",
      "Tamil"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 201,
    "releaseDate": new Date("2026-09-01"),
    "certificate": "A",
    "posterUrl": "/posters/animal.svg",
    "posterPublicId": "showtime/posters/animal",
    "backdropUrl": "/posters/animal-wide.svg",
    "backdropPublicId": "showtime/backdrops/animal",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.4,
    "votes": 275000,
    "director": "Sandeep Reddy Vanga",
    "cast": [
      {
        "name": "Ranbir Kapoor",
        "role": "Ranvijay Singh",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Anil Kapoor",
        "role": "Balbir Singh",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Rashmika Mandanna",
        "role": "Geetanjali",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Bobby Deol",
        "role": "Abrar Haque",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Oppenheimer",
    "description": "The monumental biographical epic tracing theoretical physicist J. Robert Oppenheimer during the Manhattan Project and the subsequent fallout of the nuclear age.",
    "genres": [
      "Biography",
      "Drama",
      "History"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 180,
    "releaseDate": new Date("2026-07-21"),
    "certificate": "A",
    "posterUrl": "/posters/oppenheimer.svg",
    "posterPublicId": "showtime/posters/oppenheimer",
    "backdropUrl": "/posters/oppenheimer-wide.svg",
    "backdropPublicId": "showtime/backdrops/oppenheimer",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 9.2,
    "votes": 489000,
    "director": "Christopher Nolan",
    "cast": [
      {
        "name": "Cillian Murphy",
        "role": "J. Robert Oppenheimer",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Emily Blunt",
        "role": "Katherine Oppenheimer",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Matt Damon",
        "role": "Leslie Groves",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Robert Downey Jr.",
        "role": "Lewis Strauss",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Dune: Part Two",
    "description": "Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family, confronting his dread prophecy.",
    "genres": [
      "Sci-Fi",
      "Adventure",
      "Action"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 166,
    "releaseDate": new Date("2026-08-30"),
    "certificate": "UA",
    "posterUrl": "/posters/dune-part-two.svg",
    "posterPublicId": "showtime/posters/dune-part-two",
    "backdropUrl": "/posters/dune-part-two-wide.svg",
    "backdropPublicId": "showtime/backdrops/dune-part-two",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 9.1,
    "votes": 395000,
    "director": "Denis Villeneuve",
    "cast": [
      {
        "name": "Timothée Chalamet",
        "role": "Paul Atreides",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Zendaya",
        "role": "Chani",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Rebecca Ferguson",
        "role": "Lady Jessica",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Austin Butler",
        "role": "Feyd-Rautha Harkonnen",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Manjummel Boys",
    "description": "A group of close-knit friends from Kochi travel to Kodaikanal where a harrowing subterranean accident in Guna Caves tests the limits of courage and brotherhood.",
    "genres": [
      "Adventure",
      "Thriller",
      "Drama"
    ],
    "languages": [
      "Malayalam",
      "Tamil",
      "Telugu",
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 135,
    "releaseDate": new Date("2026-09-05"),
    "certificate": "U",
    "posterUrl": "/posters/manjummel-boys.svg",
    "posterPublicId": "showtime/posters/manjummel-boys",
    "backdropUrl": "/posters/manjummel-boys-wide.svg",
    "backdropPublicId": "showtime/backdrops/manjummel-boys",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.9,
    "votes": 164000,
    "director": "Chidambaram",
    "cast": [
      {
        "name": "Soubin Shahir",
        "role": "Kuttan",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Sreenath Bhasi",
        "role": "Subhash",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Balu Varghese",
        "role": "Sixen",
        "imageUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80"
      },
      {
        "name": "Ganapathi",
        "role": "Sudhi",
        "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Aadujeevitham - The Goat Life",
    "description": "Based on the acclaimed novel, an immigrant laborer forced into servitude as a goatherd in the harsh Saudi Arabian desert undertakes an unimaginable escape.",
    "genres": [
      "Adventure",
      "Biography",
      "Drama"
    ],
    "languages": [
      "Malayalam",
      "Tamil",
      "Hindi",
      "Kannada"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 172,
    "releaseDate": new Date("2026-08-20"),
    "certificate": "UA",
    "posterUrl": "/posters/aadujeevitham-the-goat-life.svg",
    "posterPublicId": "showtime/posters/aadujeevitham-the-goat-life",
    "backdropUrl": "/posters/aadujeevitham-the-goat-life-wide.svg",
    "backdropPublicId": "showtime/backdrops/aadujeevitham-the-goat-life",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.7,
    "votes": 112000,
    "director": "Blessy",
    "cast": [
      {
        "name": "Prithviraj Sukumaran",
        "role": "Najeeb Muhammad",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Jimmy Jean-Louis",
        "role": "Ibrahim Khadiri",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Amala Paul",
        "role": "Sainu",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "KR Gokul",
        "role": "Hakeem",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Hanu-Man",
    "description": "A modest thief in an idyllic village acquires extraordinary divine abilities through a sun gem, becoming the reluctant champion against modern biomechanical evil.",
    "genres": [
      "Action",
      "Fantasy",
      "Adventure"
    ],
    "languages": [
      "Telugu",
      "Hindi",
      "Tamil",
      "Kannada"
    ],
    "formats": [
      "2D",
      "3D"
    ],
    "durationMin": 158,
    "releaseDate": new Date("2026-07-28"),
    "certificate": "U",
    "posterUrl": "/posters/hanu-man.svg",
    "posterPublicId": "showtime/posters/hanu-man",
    "backdropUrl": "/posters/hanu-man-wide.svg",
    "backdropPublicId": "showtime/backdrops/hanu-man",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.6,
    "votes": 198000,
    "director": "Prasanth Varma",
    "cast": [
      {
        "name": "Teja Sajja",
        "role": "Hanumanthu",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Amritha Aiyer",
        "role": "Meenakshi",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Varalaxmi Sarathkumar",
        "role": "Anjamma",
        "imageUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80"
      },
      {
        "name": "Vinay Rai",
        "role": "Michael",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Leo",
    "description": "A quiet animal rescuer and cafe owner in Himachal Pradesh is thrust into explosive chaos when dangerous cartel figures mistake him for an infamous mob kingpin.",
    "genres": [
      "Action",
      "Thriller",
      "Crime"
    ],
    "languages": [
      "Tamil",
      "Telugu",
      "Hindi",
      "Kannada"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 164,
    "releaseDate": new Date("2026-09-02"),
    "certificate": "A",
    "posterUrl": "/posters/leo.svg",
    "posterPublicId": "showtime/posters/leo",
    "backdropUrl": "/posters/leo-wide.svg",
    "backdropPublicId": "showtime/backdrops/leo",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.1,
    "votes": 230000,
    "director": "Lokesh Kanagaraj",
    "cast": [
      {
        "name": "Thalapathy Vijay",
        "role": "Parthiban / Leo Das",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Sanjay Dutt",
        "role": "Antony Das",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Trisha Krishnan",
        "role": "Sathya",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Arjun Sarja",
        "role": "Harold Das",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Jailer",
    "description": "A retired prison warden leads an unassuming domestic life until a brazen artifact smuggling syndicate targets his law enforcement son, unleashing his dormant fury.",
    "genres": [
      "Action",
      "Comedy",
      "Crime"
    ],
    "languages": [
      "Tamil",
      "Telugu",
      "Hindi",
      "Kannada"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 168,
    "releaseDate": new Date("2026-08-10"),
    "certificate": "UA",
    "posterUrl": "/posters/jailer.svg",
    "posterPublicId": "showtime/posters/jailer",
    "backdropUrl": "/posters/jailer-wide.svg",
    "backdropPublicId": "showtime/backdrops/jailer",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.4,
    "votes": 210000,
    "director": "Nelson Dilipkumar",
    "cast": [
      {
        "name": "Rajinikanth",
        "role": "Muthuvel Pandian",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Mohanlal",
        "role": "Mathew",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Shiva Rajkumar",
        "role": "Narasimha",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Ramya Krishnan",
        "role": "Vijaya Pandian",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "12th Fail",
    "description": "The stirring true story of Manoj Kumar Sharma who restarts his academic journey from abject poverty to conquering the nation’s toughest civil service exams.",
    "genres": [
      "Biography",
      "Drama"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 147,
    "releaseDate": new Date("2026-08-01"),
    "certificate": "U",
    "posterUrl": "/posters/twelfth-fail.svg",
    "posterPublicId": "showtime/posters/twelfth-fail",
    "backdropUrl": "/posters/twelfth-fail-wide.svg",
    "backdropPublicId": "showtime/backdrops/twelfth-fail",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 9.4,
    "votes": 380000,
    "director": "Vidhu Vinod Chopra",
    "cast": [
      {
        "name": "Vikrant Massey",
        "role": "Manoj Kumar Sharma",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Medha Shankr",
        "role": "Shraddha Joshi",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Anant V Joshi",
        "role": "Pritam Pandey",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Anshumaan Pushkar",
        "role": "Gauri Bhaiya",
        "imageUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Shaitaan",
    "description": "A relaxing family weekend getaway turns into an excruciating supernatural hostage battle when an enigmatic stranger manipulates their daughter with dark hypnosis.",
    "genres": [
      "Horror",
      "Thriller"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 132,
    "releaseDate": new Date("2026-09-10"),
    "certificate": "A",
    "posterUrl": "/posters/shaitaan.svg",
    "posterPublicId": "showtime/posters/shaitaan",
    "backdropUrl": "/posters/shaitaan-wide.svg",
    "backdropPublicId": "showtime/backdrops/shaitaan",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.8,
    "votes": 89000,
    "director": "Vikas Bahl",
    "cast": [
      {
        "name": "Ajay Devgn",
        "role": "Kabir Rishi",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "R. Madhavan",
        "role": "Vanraj",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Jyotika",
        "role": "Jyoti Rishi",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Janki Bodiwala",
        "role": "Janvi Rishi",
        "imageUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Article 370",
    "description": "In the wake of civil unrest in Kashmir, an intelligence operative is selected for a covert operation to eliminate conflict economy and facilitate state integration.",
    "genres": [
      "Action",
      "Drama",
      "Thriller"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 158,
    "releaseDate": new Date("2026-08-15"),
    "certificate": "UA",
    "posterUrl": "/posters/article-370.svg",
    "posterPublicId": "showtime/posters/article-370",
    "backdropUrl": "/posters/article-370-wide.svg",
    "backdropPublicId": "showtime/backdrops/article-370",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.2,
    "votes": 94000,
    "director": "Aditya Suhas Jambhale",
    "cast": [
      {
        "name": "Yami Gautam",
        "role": "Zooni Haksar",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Priyamani",
        "role": "Rajeshwari Swaminathan",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Arun Govil",
        "role": "Prime Minister",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Kiran Karmarkar",
        "role": "Home Minister",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Premalu",
    "description": "An easygoing engineering graduate moves to Hyderabad for GATE coaching where he falls head-over-heels for a spunky software professional with rival suitors.",
    "genres": [
      "Comedy",
      "Romance"
    ],
    "languages": [
      "Malayalam",
      "Telugu",
      "Tamil"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 156,
    "releaseDate": new Date("2026-08-05"),
    "certificate": "U",
    "posterUrl": "/posters/premalu.svg",
    "posterPublicId": "showtime/posters/premalu",
    "backdropUrl": "/posters/premalu-wide.svg",
    "backdropPublicId": "showtime/backdrops/premalu",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.5,
    "votes": 126000,
    "director": "Girish A.D.",
    "cast": [
      {
        "name": "Naslen K. Gafoor",
        "role": "Sachin",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Mamitha Baiju",
        "role": "Reenu",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Shyam Mohan",
        "role": "Aadhi",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Sangeeth Prathap",
        "role": "Amal Davis",
        "imageUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Godzilla x Kong: The New Empire",
    "description": "An explosive battle pits the almighty Kong and fearsome Godzilla against a colossal undiscovered threat hidden deep within our hollow earth.",
    "genres": [
      "Action",
      "Sci-Fi",
      "Adventure"
    ],
    "languages": [
      "English",
      "Hindi",
      "Tamil",
      "Telugu"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 115,
    "releaseDate": new Date("2026-09-08"),
    "certificate": "UA",
    "posterUrl": "/posters/godzilla-x-kong-the-new-empire.svg",
    "posterPublicId": "showtime/posters/godzilla-x-kong-the-new-empire",
    "backdropUrl": "/posters/godzilla-x-kong-the-new-empire-wide.svg",
    "backdropPublicId": "showtime/backdrops/godzilla-x-kong-the-new-empire",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.6,
    "votes": 215000,
    "director": "Adam Wingard",
    "cast": [
      {
        "name": "Rebecca Hall",
        "role": "Dr. Ilene Andrews",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Brian Tyree Henry",
        "role": "Bernie Hayes",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Dan Stevens",
        "role": "Trapper",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Kaylee Hottle",
        "role": "Jia",
        "imageUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Kung Fu Panda 4",
    "description": "Po must train a new Dragon Warrior while battling a shape-shifting sorceress named The Chameleon who can re-summon villains from the spirit realm.",
    "genres": [
      "Animation",
      "Action",
      "Comedy"
    ],
    "languages": [
      "English",
      "Hindi",
      "Tamil",
      "Telugu"
    ],
    "formats": [
      "2D",
      "3D"
    ],
    "durationMin": 94,
    "releaseDate": new Date("2026-08-11"),
    "certificate": "U",
    "posterUrl": "/posters/kung-fu-panda-4.svg",
    "posterPublicId": "showtime/posters/kung-fu-panda-4",
    "backdropUrl": "/posters/kung-fu-panda-4-wide.svg",
    "backdropPublicId": "showtime/backdrops/kung-fu-panda-4",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.7,
    "votes": 110000,
    "director": "Mike Mitchell",
    "cast": [
      {
        "name": "Jack Black",
        "role": "Po (voice)",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Awkwafina",
        "role": "Zhen (voice)",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Viola Davis",
        "role": "The Chameleon (voice)",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Dustin Hoffman",
        "role": "Master Shifu (voice)",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Aavesham",
    "description": "Three young engineering students in Bengaluru get bullied by seniors and recruit a quirky local gangster named Ranga to teach their college rivals a lesson.",
    "genres": [
      "Action",
      "Comedy"
    ],
    "languages": [
      "Malayalam",
      "Tamil",
      "Telugu",
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 158,
    "releaseDate": new Date("2026-09-12"),
    "certificate": "UA",
    "posterUrl": "/posters/aavesham.svg",
    "posterPublicId": "showtime/posters/aavesham",
    "backdropUrl": "/posters/aavesham-wide.svg",
    "backdropPublicId": "showtime/backdrops/aavesham",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.8,
    "votes": 184000,
    "director": "Jithu Madhavan",
    "cast": [
      {
        "name": "Fahadh Faasil",
        "role": "Ranga",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Hipzster",
        "role": "Aju",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Mithun Jai Shankar",
        "role": "Bibi",
        "imageUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80"
      },
      {
        "name": "Roshan Shanavas",
        "role": "Shanthakumaran",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Bramayugam",
    "description": "A 17th-century folk singer fleeing slave trade seeks refuge in a mysterious crumbling manor whose enigmatic feudal master plays deadly ritualistic mind games.",
    "genres": [
      "Horror",
      "Mystery",
      "Thriller"
    ],
    "languages": [
      "Malayalam",
      "Tamil",
      "Telugu",
      "Kannada"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 139,
    "releaseDate": new Date("2026-08-28"),
    "certificate": "A",
    "posterUrl": "/posters/bramayugam.svg",
    "posterPublicId": "showtime/posters/bramayugam",
    "backdropUrl": "/posters/bramayugam-wide.svg",
    "backdropPublicId": "showtime/backdrops/bramayugam",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.6,
    "votes": 142000,
    "director": "Rahul Sadasivan",
    "cast": [
      {
        "name": "Mammootty",
        "role": "Kodumon Potti",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Arjun Ashokan",
        "role": "Thevan",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Sidharth Bharathan",
        "role": "The Cook",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Amalda Liz",
        "role": "Yakshi",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Captain Miller",
    "description": "In 1930s British India, a renegade former colonial soldier turned rebel warrior leads daring raids against oppressor forces to safeguard his people’s heritage.",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "languages": [
      "Tamil",
      "Telugu",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 157,
    "releaseDate": new Date("2026-08-08"),
    "certificate": "UA",
    "posterUrl": "/posters/captain-miller.svg",
    "posterPublicId": "showtime/posters/captain-miller",
    "backdropUrl": "/posters/captain-miller-wide.svg",
    "backdropPublicId": "showtime/backdrops/captain-miller",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.9,
    "votes": 81000,
    "director": "Arun Matheswaran",
    "cast": [
      {
        "name": "Dhanush",
        "role": "Analeesan / Captain Miller",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Shiva Rajkumar",
        "role": "Sengolan",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Priyanka Arul Mohan",
        "role": "Velmathi",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Sundeep Kishan",
        "role": "Captain Rafi",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Merry Christmas",
    "description": "On Christmas Eve in 1980s Mumbai, two strangers meet by chance and forge a seductive connection that spirals into a night of deception, murder and intrigue.",
    "genres": [
      "Mystery",
      "Thriller",
      "Romance"
    ],
    "languages": [
      "Hindi",
      "Tamil"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 144,
    "releaseDate": new Date("2026-07-15"),
    "certificate": "UA",
    "posterUrl": "/posters/merry-christmas.svg",
    "posterPublicId": "showtime/posters/merry-christmas",
    "backdropUrl": "/posters/merry-christmas-wide.svg",
    "backdropPublicId": "showtime/backdrops/merry-christmas",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.8,
    "votes": 62000,
    "director": "Sriram Raghavan",
    "cast": [
      {
        "name": "Katrina Kaif",
        "role": "Maria",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Vijay Sethupathi",
        "role": "Albert",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Sanjay Kapoor",
        "role": "Ronnie",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Radhika Apte",
        "role": "Cameo Officer",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Teri Baaton Mein Aisa Uljha Jiya",
    "description": "A robotics programmer falls helplessly in love with a charming, intelligent woman in the United States, unaware that she is a state-of-the-art AI android.",
    "genres": [
      "Comedy",
      "Romance",
      "Sci-Fi"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 143,
    "releaseDate": new Date("2026-08-04"),
    "certificate": "U",
    "posterUrl": "/posters/teri-baaton-mein-aisa-uljha-jiya.svg",
    "posterPublicId": "showtime/posters/teri-baaton-mein-aisa-uljha-jiya",
    "backdropUrl": "/posters/teri-baaton-mein-aisa-uljha-jiya-wide.svg",
    "backdropPublicId": "showtime/backdrops/teri-baaton-mein-aisa-uljha-jiya",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.4,
    "votes": 79000,
    "director": "Amit Joshi",
    "cast": [
      {
        "name": "Shahid Kapoor",
        "role": "Aryan Agnihotri",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Kriti Sanon",
        "role": "SIFRA",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Dharmendra",
        "role": "Jai Singh",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Dimple Kapadia",
        "role": "Urmila Shukla",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Madgaon Express",
    "description": "Three childhood buddies finally fulfill their dream trip to Goa on the Madgaon Express, only to mistakenly take luggage packed with contraband and mob guns.",
    "genres": [
      "Comedy",
      "Adventure"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 143,
    "releaseDate": new Date("2026-08-22"),
    "certificate": "UA",
    "posterUrl": "/posters/madgaon-express.svg",
    "posterPublicId": "showtime/posters/madgaon-express",
    "backdropUrl": "/posters/madgaon-express-wide.svg",
    "backdropPublicId": "showtime/backdrops/madgaon-express",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.3,
    "votes": 115000,
    "director": "Kunal Kemmu",
    "cast": [
      {
        "name": "Divyenndu",
        "role": "Dhanush / Dodo",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Pratik Gandhi",
        "role": "Pratik / Pinku",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Avinash Tiwary",
        "role": "Ayush",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Nora Fatehi",
        "role": "Tasha",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Crew",
    "description": "Three spirited flight attendants for a bankrupt airline get swept into an absurd, lucrative gold-smuggling heist when a passenger dies mid-flight.",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 120,
    "releaseDate": new Date("2026-08-18"),
    "certificate": "UA",
    "posterUrl": "/posters/crew.svg",
    "posterPublicId": "showtime/posters/crew",
    "backdropUrl": "/posters/crew-wide.svg",
    "backdropPublicId": "showtime/backdrops/crew",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.6,
    "votes": 82000,
    "director": "Rajesh A Krishnan",
    "cast": [
      {
        "name": "Tabu",
        "role": "Geeta Sethi",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Kareena Kapoor Khan",
        "role": "Jasmine Kohli",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Kriti Sanon",
        "role": "Divya Rana",
        "imageUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80"
      },
      {
        "name": "Diljit Dosanjh",
        "role": "Jaiveer Singh",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "The Fall Guy",
    "description": "A battle-scarred Hollywood stuntman is called out of retirement to find a missing movie star, untangle a sinister conspiracy, and win back his director ex.",
    "genres": [
      "Action",
      "Comedy"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 126,
    "releaseDate": new Date("2026-07-29"),
    "certificate": "UA",
    "posterUrl": "/posters/the-fall-guy.svg",
    "posterPublicId": "showtime/posters/the-fall-guy",
    "backdropUrl": "/posters/the-fall-guy-wide.svg",
    "backdropPublicId": "showtime/backdrops/the-fall-guy",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.8,
    "votes": 148000,
    "director": "David Leitch",
    "cast": [
      {
        "name": "Ryan Gosling",
        "role": "Colt Seavers",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Emily Blunt",
        "role": "Jody Moreno",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Aaron Taylor-Johnson",
        "role": "Tom Ryder",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Hannah Waddingham",
        "role": "Gail Meyer",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Furiosa: A Mad Max Saga",
    "description": "Kidnapped from the Green Place of Many Mothers, young Furiosa survives warlord battles across the desolate Wasteland to seek her way home.",
    "genres": [
      "Action",
      "Sci-Fi",
      "Adventure"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 148,
    "releaseDate": new Date("2026-08-25"),
    "certificate": "A",
    "posterUrl": "/posters/furiosa-a-mad-max-saga.svg",
    "posterPublicId": "showtime/posters/furiosa-a-mad-max-saga",
    "backdropUrl": "/posters/furiosa-a-mad-max-saga-wide.svg",
    "backdropPublicId": "showtime/backdrops/furiosa-a-mad-max-saga",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.5,
    "votes": 195000,
    "director": "George Miller",
    "cast": [
      {
        "name": "Anya Taylor-Joy",
        "role": "Imperator Furiosa",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Chris Hemsworth",
        "role": "Warlord Dementus",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Tom Burke",
        "role": "Praetorian Jack",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Lachy Hulme",
        "role": "Immortan Joe",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Kingdom of the Planet of the Apes",
    "description": "Centuries after Caesar’s reign, a young chimpanzee embarks on a dangerous journey with a feral human woman that will determine the future for apes and mankind.",
    "genres": [
      "Sci-Fi",
      "Action",
      "Adventure"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX"
    ],
    "durationMin": 145,
    "releaseDate": new Date("2026-08-16"),
    "certificate": "UA",
    "posterUrl": "/posters/kingdom-of-the-planet-of-the-apes.svg",
    "posterPublicId": "showtime/posters/kingdom-of-the-planet-of-the-apes",
    "backdropUrl": "/posters/kingdom-of-the-planet-of-the-apes-wide.svg",
    "backdropPublicId": "showtime/backdrops/kingdom-of-the-planet-of-the-apes",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.9,
    "votes": 132000,
    "director": "Wes Ball",
    "cast": [
      {
        "name": "Owen Teague",
        "role": "Noa",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Freya Allan",
        "role": "Mae / Nova",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Kevin Durand",
        "role": "Proximus Caesar",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Peter Macon",
        "role": "Raka",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Chandu Champion",
    "description": "The triumph and tenacity of Murlikant Petkar, an Indian soldier who miraculously survived nine bullet wounds to become India’s very first Paralympic gold medalist.",
    "genres": [
      "Biography",
      "Drama",
      "Sports"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 143,
    "releaseDate": new Date("2026-08-20"),
    "certificate": "U",
    "posterUrl": "/posters/chandu-champion.svg",
    "posterPublicId": "showtime/posters/chandu-champion",
    "backdropUrl": "/posters/chandu-champion-wide.svg",
    "backdropPublicId": "showtime/backdrops/chandu-champion",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.6,
    "votes": 110000,
    "director": "Kabir Khan",
    "cast": [
      {
        "name": "Kartik Aaryan",
        "role": "Murlikant Petkar",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Vijay Raaz",
        "role": "Coach Tiger Ali",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Bhuvan Arora",
        "role": "Garnail Singh",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Yashpal Sharma",
        "role": "Subedar Uttam Singh",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Bad Newz",
    "description": "A hilarious medical rarity known as heteropaternal superfecundation creates chaotic romantic rivalry when two men discover they fathered twins with one woman.",
    "genres": [
      "Comedy",
      "Romance"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 142,
    "releaseDate": new Date("2026-09-02"),
    "certificate": "UA",
    "posterUrl": "/posters/bad-newz.svg",
    "posterPublicId": "showtime/posters/bad-newz",
    "backdropUrl": "/posters/bad-newz-wide.svg",
    "backdropPublicId": "showtime/backdrops/bad-newz",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.2,
    "votes": 68000,
    "director": "Anand Tiwari",
    "cast": [
      {
        "name": "Vicky Kaushal",
        "role": "Akhil Chadha",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Triptii Dimri",
        "role": "Saloni Bagga",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Ammy Virk",
        "role": "Gurbir Pannu",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Neha Dhupia",
        "role": "Dr. Baweja",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Raayan",
    "description": "A modest fast-food cook in North Chennai who strives to shield his younger siblings gets dragged into ruthless gang warfare when his brother commits murder.",
    "genres": [
      "Action",
      "Crime",
      "Drama"
    ],
    "languages": [
      "Tamil",
      "Telugu",
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 145,
    "releaseDate": new Date("2026-09-04"),
    "certificate": "A",
    "posterUrl": "/posters/raayan.svg",
    "posterPublicId": "showtime/posters/raayan",
    "backdropUrl": "/posters/raayan-wide.svg",
    "backdropPublicId": "showtime/backdrops/raayan",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.2,
    "votes": 118000,
    "director": "Dhanush",
    "cast": [
      {
        "name": "Dhanush",
        "role": "Kathavaraayan / Raayan",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "S.J. Suryah",
        "role": "Sethuraman",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Sundeep Kishan",
        "role": "Muthuvelraayan",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Dushara Vijayan",
        "role": "Durga",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Stree 2: Sarkate Ka Aatank",
    "description": "The eccentric residents of Chanderi unite once more alongside the benevolent spirit Stree to battle a terrifying headless phantom who abducts progressive women.",
    "genres": [
      "Comedy",
      "Horror"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX"
    ],
    "durationMin": 147,
    "releaseDate": new Date("2026-09-15"),
    "certificate": "UA",
    "posterUrl": "/posters/stree-2-sarkate-ka-aatank.svg",
    "posterPublicId": "showtime/posters/stree-2-sarkate-ka-aatank",
    "backdropUrl": "/posters/stree-2-sarkate-ka-aatank-wide.svg",
    "backdropPublicId": "showtime/backdrops/stree-2-sarkate-ka-aatank",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.7,
    "votes": 265000,
    "director": "Amar Kaushik",
    "cast": [
      {
        "name": "Rajkummar Rao",
        "role": "Vicky",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Shraddha Kapoor",
        "role": "The Unknown Maiden",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Pankaj Tripathi",
        "role": "Rudra Bhaiya",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Abhishek Banerjee",
        "role": "Jana",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Khel Khel Mein",
    "description": "During a festive wedding weekend, seven long-time friends play a dangerous dinner game where all incoming phone calls and text messages must be publicly shared.",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 134,
    "releaseDate": new Date("2026-09-08"),
    "certificate": "UA",
    "posterUrl": "/posters/khel-khel-mein.svg",
    "posterPublicId": "showtime/posters/khel-khel-mein",
    "backdropUrl": "/posters/khel-khel-mein-wide.svg",
    "backdropPublicId": "showtime/backdrops/khel-khel-mein",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 7.5,
    "votes": 72000,
    "director": "Mudassar Aziz",
    "cast": [
      {
        "name": "Akshay Kumar",
        "role": "Rishabh Malik",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Taapsee Pannu",
        "role": "Happy Kaur",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Fardeen Khan",
        "role": "Kabir Deshmukh",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Vaani Kapoor",
        "role": "Vartika Malik",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Devara: Part 1",
    "description": "In an isolated coastal realm governed by sea marauders, a noble guardian refuses to let his people be exploited as weapon smugglers, sparking generational rebellion.",
    "genres": [
      "Action",
      "Drama",
      "Thriller"
    ],
    "languages": [
      "Telugu",
      "Hindi",
      "Tamil",
      "Kannada"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 178,
    "releaseDate": new Date("2026-09-27"),
    "certificate": "UA",
    "posterUrl": "/posters/devara-part-1.svg",
    "posterPublicId": "showtime/posters/devara-part-1",
    "backdropUrl": "/posters/devara-part-1-wide.svg",
    "backdropPublicId": "showtime/backdrops/devara-part-1",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.4,
    "votes": 210000,
    "director": "Koratala Siva",
    "cast": [
      {
        "name": "Jr NTR",
        "role": "Devara / Vara",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Saif Ali Khan",
        "role": "Bhaira",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Janhvi Kapoor",
        "role": "Thangam",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Prakash Raj",
        "role": "Singappa",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Jigra",
    "description": "An undaunted sister risks everything and orchestrates a desperate, meticulously planned maximum-security prison break in a foreign country to save her brother.",
    "genres": [
      "Action",
      "Drama",
      "Thriller"
    ],
    "languages": [
      "Hindi",
      "Telugu"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 153,
    "releaseDate": new Date("2026-10-11"),
    "certificate": "UA",
    "posterUrl": "/posters/jigra.svg",
    "posterPublicId": "showtime/posters/jigra",
    "backdropUrl": "/posters/jigra-wide.svg",
    "backdropPublicId": "showtime/backdrops/jigra",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8,
    "votes": 88000,
    "director": "Vasan Bala",
    "cast": [
      {
        "name": "Alia Bhatt",
        "role": "Satya Anand",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Vedang Raina",
        "role": "Ankur Anand",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Manoj Pahwa",
        "role": "Bhatia Ji",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Rahul Ravindran",
        "role": "Muthu",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Vettaiyan",
    "description": "A celebrated encounter specialist officer grapples with the morality of vigilante justice after a public shooting exposes systemic corporate bribery.",
    "genres": [
      "Action",
      "Drama"
    ],
    "languages": [
      "Tamil",
      "Telugu",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 163,
    "releaseDate": new Date("2026-10-10"),
    "certificate": "UA",
    "posterUrl": "/posters/vettaiyan.svg",
    "posterPublicId": "showtime/posters/vettaiyan",
    "backdropUrl": "/posters/vettaiyan-wide.svg",
    "backdropPublicId": "showtime/backdrops/vettaiyan",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.1,
    "votes": 142000,
    "director": "T.J. Gnanavel",
    "cast": [
      {
        "name": "Rajinikanth",
        "role": "SP Athiyan",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Amitabh Bachchan",
        "role": "Justice Sathyadev",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Fahadh Faasil",
        "role": "Patrick",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Manju Warrier",
        "role": "Thara Athiyan",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Deadpool & Wolverine",
    "description": "A listless Wade Wilson is pulled into the Time Variance Authority to save his home universe, teaming up with a crestfallen, alternate-timeline Wolverine.",
    "genres": [
      "Action",
      "Comedy",
      "Sci-Fi"
    ],
    "languages": [
      "English",
      "Hindi",
      "Tamil",
      "Telugu"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 128,
    "releaseDate": new Date("2026-09-20"),
    "certificate": "A",
    "posterUrl": "/posters/deadpool-and-wolverine.svg",
    "posterPublicId": "showtime/posters/deadpool-and-wolverine",
    "backdropUrl": "/posters/deadpool-and-wolverine-wide.svg",
    "backdropPublicId": "showtime/backdrops/deadpool-and-wolverine",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 8.9,
    "votes": 420000,
    "director": "Shawn Levy",
    "cast": [
      {
        "name": "Ryan Reynolds",
        "role": "Wade Wilson / Deadpool",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Hugh Jackman",
        "role": "Logan / Wolverine",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Emma Corrin",
        "role": "Cassandra Nova",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Matthew Macfadyen",
        "role": "Mr. Paradox",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.NOW_SHOWING
  },
  {
    "title": "Singham Again",
    "description": "Bajirao Singham marshals an elite brigade of cop universe heroes to rescue his abducted wife in a thunderous cross-border campaign inspired by the Ramayana.",
    "genres": [
      "Action",
      "Drama"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 155,
    "releaseDate": new Date("2026-11-01"),
    "certificate": "UA",
    "posterUrl": "/posters/singham-again.svg",
    "posterPublicId": "showtime/posters/singham-again",
    "backdropUrl": "/posters/singham-again-wide.svg",
    "backdropPublicId": "showtime/backdrops/singham-again",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Rohit Shetty",
    "cast": [
      {
        "name": "Ajay Devgn",
        "role": "DCP Bajirao Singham",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Kareena Kapoor Khan",
        "role": "Avni Kamat Singham",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Ranveer Singh",
        "role": "Sangram Bhalerao Simmba",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Deepika Padukone",
        "role": "SP Shakti Shetty",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Bhool Bhulaiyaa 3",
    "description": "Rooh Baba journeys to a royal estate in Bengal to debunk a sinister royal curse, only to unleash twin spirits claiming to be the authentic vengeful Manjulika.",
    "genres": [
      "Comedy",
      "Horror"
    ],
    "languages": [
      "Hindi"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 150,
    "releaseDate": new Date("2026-11-01"),
    "certificate": "UA",
    "posterUrl": "/posters/bhool-bhulaiyaa-3.svg",
    "posterPublicId": "showtime/posters/bhool-bhulaiyaa-3",
    "backdropUrl": "/posters/bhool-bhulaiyaa-3-wide.svg",
    "backdropPublicId": "showtime/backdrops/bhool-bhulaiyaa-3",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Anees Bazmee",
    "cast": [
      {
        "name": "Kartik Aaryan",
        "role": "Ruhan Randhawa / Rooh Baba",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Vidya Balan",
        "role": "Manjulika",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Madhuri Dixit",
        "role": "Mandira",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Triptii Dimri",
        "role": "Meera",
        "imageUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Kanguva",
    "description": "A dual-timeline mythic fantasy bridging a fierce medieval tribal chieftain’s sacrifice with a contemporary bounty hunter’s unresolved cosmic destiny.",
    "genres": [
      "Action",
      "Fantasy"
    ],
    "languages": [
      "Tamil",
      "Telugu",
      "Hindi",
      "Malayalam"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX"
    ],
    "durationMin": 160,
    "releaseDate": new Date("2026-11-14"),
    "certificate": "UA",
    "posterUrl": "/posters/kanguva.svg",
    "posterPublicId": "showtime/posters/kanguva",
    "backdropUrl": "/posters/kanguva-wide.svg",
    "backdropPublicId": "showtime/backdrops/kanguva",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Siva",
    "cast": [
      {
        "name": "Suriya",
        "role": "Kanguva / Francis",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Bobby Deol",
        "role": "Udhiran",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Disha Patani",
        "role": "Angela",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Jagapathi Babu",
        "role": "Clan Elder",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Gladiator II",
    "description": "Years after Maximus’s death, Lucius is captured from his peaceful home and forced into the Colosseum, seeking vengeance to restore glory to Rome.",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 148,
    "releaseDate": new Date("2026-11-15"),
    "certificate": "A",
    "posterUrl": "/posters/gladiator-ii.svg",
    "posterPublicId": "showtime/posters/gladiator-ii",
    "backdropUrl": "/posters/gladiator-ii-wide.svg",
    "backdropPublicId": "showtime/backdrops/gladiator-ii",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Ridley Scott",
    "cast": [
      {
        "name": "Paul Mescal",
        "role": "Lucius Verus",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Pedro Pascal",
        "role": "Marcus Acacius",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Denzel Washington",
        "role": "Macrinus",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Connie Nielsen",
        "role": "Lucilla",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Pushpa 2: The Rule",
    "description": "Pushpa Raj expands his red sandalwood empire into an unassailable international syndicate, confronting ruthless police chief Bhanwar Singh Shekhawat.",
    "genres": [
      "Action",
      "Crime",
      "Drama"
    ],
    "languages": [
      "Telugu",
      "Hindi",
      "Tamil",
      "Kannada"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 185,
    "releaseDate": new Date("2026-12-05"),
    "certificate": "UA",
    "posterUrl": "/posters/pushpa-2-the-rule.svg",
    "posterPublicId": "showtime/posters/pushpa-2-the-rule",
    "backdropUrl": "/posters/pushpa-2-the-rule-wide.svg",
    "backdropPublicId": "showtime/backdrops/pushpa-2-the-rule",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Sukumar",
    "cast": [
      {
        "name": "Allu Arjun",
        "role": "Pushpa Raj",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Rashmika Mandanna",
        "role": "Srivalli",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Fahadh Faasil",
        "role": "SP Bhanwar Singh Shekhawat",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Jagadeesh Prathap Bandari",
        "role": "Kesava",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Baby John",
    "description": "An erstwhile celebrated police commissioner fakes his death to raise his daughter in solitude until ruthless underworld lords uncover his whereabouts.",
    "genres": [
      "Action",
      "Thriller"
    ],
    "languages": [
      "Hindi",
      "Tamil"
    ],
    "formats": [
      "2D"
    ],
    "durationMin": 145,
    "releaseDate": new Date("2026-12-25"),
    "certificate": "UA",
    "posterUrl": "/posters/baby-john.svg",
    "posterPublicId": "showtime/posters/baby-john",
    "backdropUrl": "/posters/baby-john-wide.svg",
    "backdropPublicId": "showtime/backdrops/baby-john",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "A. Kaleeswaran",
    "cast": [
      {
        "name": "Varun Dhawan",
        "role": "Baby John / DCP Satya",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Keerthy Suresh",
        "role": "Rhea",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Wamiqa Gabbi",
        "role": "Tara",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Jackie Shroff",
        "role": "Babbar Sher",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Game Changer",
    "description": "An uncompromising Indian Administrative Service officer launches a relentless, brilliant crusade to reform corrupt electoral politics and fair governance.",
    "genres": [
      "Action",
      "Drama"
    ],
    "languages": [
      "Telugu",
      "Hindi",
      "Tamil"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 165,
    "releaseDate": new Date("2027-01-10"),
    "certificate": "UA",
    "posterUrl": "/posters/game-changer.svg",
    "posterPublicId": "showtime/posters/game-changer",
    "backdropUrl": "/posters/game-changer-wide.svg",
    "backdropPublicId": "showtime/backdrops/game-changer",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "S. Shankar",
    "cast": [
      {
        "name": "Ram Charan",
        "role": "Ram Nandan IAS",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Kiara Advani",
        "role": "Deepika",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "S.J. Suryah",
        "role": "Bommali",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Anjali",
        "role": "Parvathi",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Avatar: Fire and Ash",
    "description": "Jake Sully and Neytiri encounter the Ash People, an aggressive volcanic clan of Na’vi who challenge Pandora’s fragile ecological harmony.",
    "genres": [
      "Sci-Fi",
      "Adventure",
      "Action"
    ],
    "languages": [
      "English",
      "Hindi",
      "Tamil",
      "Telugu"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 190,
    "releaseDate": new Date("2027-12-18"),
    "certificate": "UA",
    "posterUrl": "/posters/avatar-fire-and-ash.svg",
    "posterPublicId": "showtime/posters/avatar-fire-and-ash",
    "backdropUrl": "/posters/avatar-fire-and-ash-wide.svg",
    "backdropPublicId": "showtime/backdrops/avatar-fire-and-ash",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "James Cameron",
    "cast": [
      {
        "name": "Sam Worthington",
        "role": "Jake Sully",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Zoe Saldana",
        "role": "Neytiri",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Sigourney Weaver",
        "role": "Kiri",
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
      },
      {
        "name": "Stephen Lang",
        "role": "Miles Quaritch",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "The Batman: Part II",
    "description": "As Gotham City fights to rebuild following the great flood, Bruce Wayne penetrates the corrupted underbelly of the Court of Owls.",
    "genres": [
      "Action",
      "Crime",
      "Mystery"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX"
    ],
    "durationMin": 170,
    "releaseDate": new Date("2027-10-02"),
    "certificate": "A",
    "posterUrl": "/posters/the-batman-part-ii.svg",
    "posterPublicId": "showtime/posters/the-batman-part-ii",
    "backdropUrl": "/posters/the-batman-part-ii-wide.svg",
    "backdropPublicId": "showtime/backdrops/the-batman-part-ii",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Matt Reeves",
    "cast": [
      {
        "name": "Robert Pattinson",
        "role": "Bruce Wayne / Batman",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Colin Farrell",
        "role": "Oswald Cobblepot / Penguin",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Andy Serkis",
        "role": "Alfred Pennyworth",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      },
      {
        "name": "Jeffrey Wright",
        "role": "Lt. James Gordon",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Ramayana: Part 1",
    "description": "The definitive cinematic adaptation of India’s timeless epic, tracking Prince Rama’s exile, devotion, and the momentous events leading up to the war against Lanka.",
    "genres": [
      "Action",
      "Drama",
      "Fantasy"
    ],
    "languages": [
      "Hindi",
      "Telugu",
      "Tamil",
      "Kannada"
    ],
    "formats": [
      "2D",
      "3D",
      "IMAX"
    ],
    "durationMin": 180,
    "releaseDate": new Date("2027-10-20"),
    "certificate": "U",
    "posterUrl": "/posters/ramayana-part-1.svg",
    "posterPublicId": "showtime/posters/ramayana-part-1",
    "backdropUrl": "/posters/ramayana-part-1-wide.svg",
    "backdropPublicId": "showtime/backdrops/ramayana-part-1",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Nitesh Tiwari",
    "cast": [
      {
        "name": "Ranbir Kapoor",
        "role": "Lord Rama",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Sai Pallavi",
        "role": "Goddess Sita",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Yash",
        "role": "Ravana",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Sunny Deol",
        "role": "Lord Hanuman",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "War 2",
    "description": "RAW’s most lethal operative Major Kabir Dhaliwal confronts a rogue tactical mastermind in a globe-trotting spy thriller across Japan, Italy, and India.",
    "genres": [
      "Action",
      "Thriller"
    ],
    "languages": [
      "Hindi",
      "Telugu",
      "Tamil"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 160,
    "releaseDate": new Date("2027-08-14"),
    "certificate": "UA",
    "posterUrl": "/posters/war-2.svg",
    "posterPublicId": "showtime/posters/war-2",
    "backdropUrl": "/posters/war-2-wide.svg",
    "backdropPublicId": "showtime/backdrops/war-2",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Ayan Mukerji",
    "cast": [
      {
        "name": "Hrithik Roshan",
        "role": "Major Kabir Dhaliwal",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Jr NTR",
        "role": "Vikram",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
      },
      {
        "name": "Kiara Advani",
        "role": "Agent Maya",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Ashutosh Rana",
        "role": "Colonel Luthra",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  },
  {
    "title": "Mission: Impossible - The Final Reckoning",
    "description": "Ethan Hunt and his IMF team face their ultimate endgame against the omnipotent rogue AI Entity, risking everything to prevent global catastrophe.",
    "genres": [
      "Action",
      "Thriller"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "formats": [
      "2D",
      "IMAX",
      "4DX"
    ],
    "durationMin": 165,
    "releaseDate": new Date("2027-05-21"),
    "certificate": "UA",
    "posterUrl": "/posters/mission-impossible-the-final-reckoning.svg",
    "posterPublicId": "showtime/posters/mission-impossible-the-final-reckoning",
    "backdropUrl": "/posters/mission-impossible-the-final-reckoning-wide.svg",
    "backdropPublicId": "showtime/backdrops/mission-impossible-the-final-reckoning",
    "trailerUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": null,
    "votes": 0,
    "director": "Christopher McQuarrie",
    "cast": [
      {
        "name": "Tom Cruise",
        "role": "Ethan Hunt",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
      },
      {
        "name": "Hayley Atwell",
        "role": "Grace",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      {
        "name": "Ving Rhames",
        "role": "Luther Stickell",
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
      },
      {
        "name": "Simon Pegg",
        "role": "Benji Dunn",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
      }
    ],
    status: MOVIE_STATUSES.COMING_SOON
  }
];

export default moviesData;
