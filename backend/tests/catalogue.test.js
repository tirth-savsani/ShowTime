import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { User } from '../models/User.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { COOKIE_NAME, USER_ROLES, MOVIE_STATUSES, BOOKING_STATUSES } from '../config/constants.js';
import { PassThrough } from 'stream';
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Catalogue Module (Spec B3, B4, B10)', () => {
  let adminCookie;
  let userCookie;
  let regularUser;
  let adminUser;

  beforeEach(async () => {
    // Mock Cloudinary streaming uploader
    jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((options, callback) => {
      const pt = new PassThrough();
      process.nextTick(() => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/showtime/image/upload/v1/mock.jpg',
          public_id: 'showtime/movies/mock_public_id',
        });
      });
      return pt;
    });
    jest.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({ result: 'ok' });

    // Seed admin & regular user
    const passwordHash = await bcrypt.hash('Password@123', 10);
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin.cat@showtime.test',
      passwordHash,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user.cat@showtime.test',
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });

    const adminToken = jwt.sign({ sub: adminUser._id.toString(), role: adminUser.role }, env.JWT_SECRET);
    const userToken = jwt.sign({ sub: regularUser._id.toString(), role: regularUser.role }, env.JWT_SECRET);

    adminCookie = `${COOKIE_NAME}=${adminToken}`;
    userCookie = `${COOKIE_NAME}=${userToken}`;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Theatres and Screens', () => {
    it('creates theatre, normalises city to Title Case, and enforces unique(city, name)', async () => {
      // 1. Create theatre with lowercase city
      const res = await request(app)
        .post('/api/admin/theatres')
        .set('Cookie', adminCookie)
        .send({
          name: 'Orion Cinemas',
          city: 'bengaluru',
          address: 'Dr Rajkumar Road, Rajajinagar',
          amenities: ['Parking', 'Food Court'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.city).toBe('Bengaluru'); // Title Case normalisation

      // 2. Duplicate check (same city and name)
      const dupRes = await request(app)
        .post('/api/admin/theatres')
        .set('Cookie', adminCookie)
        .send({
          name: 'Orion Cinemas',
          city: 'Bengaluru',
          address: 'Different address',
        });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.code).toBe('DUPLICATE');
    });

    it('GET /api/cities returns sorted distinct active theatre cities', async () => {
      await Theatre.create([
        { name: 'Regal Screens', city: 'Mumbai', address: 'Colaba' },
        { name: 'Galaxy Multiplex', city: 'Bengaluru', address: 'MG Road' },
        { name: 'Star Cinema', city: 'Delhi NCR', address: 'Connaught Place' },
        { name: 'Inactive Theatre', city: 'Kolkata', address: 'Park Street', isActive: false },
      ]);

      const res = await request(app).get('/api/cities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual(['Bengaluru', 'Delhi NCR', 'Mumbai']);
    });

    it('creates screen, calculates totalSeats, and enforces unique(theatre, name)', async () => {
      const theatre = await Theatre.create({
        name: 'PVR Forum',
        city: 'Bengaluru',
        address: 'Koramangala',
      });

      const layout = {
        rows: [
          { label: 'A', seatCount: 10, category: 'PLATINUM', aisleAfter: [5] },
          { label: 'B', seatCount: 14, category: 'GOLD', aisleAfter: [4, 10] },
        ],
      };

      const res = await request(app)
        .post('/api/admin/screens')
        .set('Cookie', adminCookie)
        .send({
          theatre: theatre._id.toString(),
          name: 'Audi 1',
          layout,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSeats).toBe(24);

      // Duplicate screen name in same theatre
      const dupRes = await request(app)
        .post('/api/admin/screens')
        .set('Cookie', adminCookie)
        .send({
          theatre: theatre._id.toString(),
          name: 'Audi 1',
          layout,
        });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.code).toBe('DUPLICATE');
    });
  });

  describe('Movies (Admin & Public)', () => {
    it('non-admin creating a movie returns 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/admin/movies')
        .set('Cookie', userCookie)
        .field('title', 'Inception')
        .field('description', 'A mind-bending psychological thriller')
        .field('durationMin', '148')
        .field('releaseDate', '2026-07-16')
        .field('certificate', 'UA')
        .field('genres', JSON.stringify(['Sci-Fi', 'Action']))
        .field('languages', JSON.stringify(['English', 'Hindi']))
        .attach('poster', Buffer.from('fake-image-bytes'), 'poster.jpg');

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('admin creates movie with poster image, multipart JSON arrays, and Cloudinary upload', async () => {
      const res = await request(app)
        .post('/api/admin/movies')
        .set('Cookie', adminCookie)
        .field('title', 'Interstellar Horizon')
        .field('description', 'A daring voyage across the galaxies to ensure human survival.')
        .field('durationMin', '169')
        .field('releaseDate', '2026-11-05')
        .field('certificate', 'UA')
        .field('genres', JSON.stringify(['Sci-Fi', 'Adventure', 'Drama']))
        .field('languages', JSON.stringify(['English', 'Hindi']))
        .field('formats', JSON.stringify(['2D', 'IMAX']))
        .field('status', MOVIE_STATUSES.NOW_SHOWING)
        .field(
          'cast',
          JSON.stringify([
            { name: 'John Doe', role: 'Cooper', imageUrl: 'https://example.com/john.jpg' },
          ])
        )
        .attach('poster', Buffer.from('fake-poster-bytes'), 'poster.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Interstellar Horizon');
      expect(res.body.data.posterUrl).toBe('https://res.cloudinary.com/showtime/image/upload/v1/mock.jpg');
      expect(res.body.data.genres).toEqual(['Sci-Fi', 'Adventure', 'Drama']);
      expect(res.body.data.cast).toHaveLength(1);
    });

    it('public GET /api/movies supports filters, search, and pagination, hiding deleted movies', async () => {
      // Create test movies
      const movie1 = await Movie.create({
        title: 'Cyberpunk Runner',
        description: 'Futuristic sci-fi action thriller in neon streets',
        genres: ['Action', 'Sci-Fi'],
        languages: ['English'],
        formats: ['2D'],
        durationMin: 120,
        releaseDate: new Date('2026-10-01'),
        certificate: 'A',
        posterUrl: 'https://example.com/poster1.jpg',
        posterPublicId: 'id1',
        status: MOVIE_STATUSES.NOW_SHOWING,
        isDeleted: false,
      });

      const movie2 = await Movie.create({
        title: 'Comedy Carnival',
        description: 'A hilarious laugh riot for the entire family',
        genres: ['Comedy'],
        languages: ['Hindi'],
        formats: ['2D'],
        durationMin: 110,
        releaseDate: new Date('2026-10-15'),
        certificate: 'U',
        posterUrl: 'https://example.com/poster2.jpg',
        posterPublicId: 'id2',
        status: MOVIE_STATUSES.NOW_SHOWING,
        isDeleted: false,
      });

      const deletedMovie = await Movie.create({
        title: 'Deleted Phantom',
        description: 'Should never appear in public listings',
        genres: ['Horror'],
        languages: ['English'],
        formats: ['2D'],
        durationMin: 95,
        releaseDate: new Date('2026-09-01'),
        certificate: 'A',
        posterUrl: 'https://example.com/deleted.jpg',
        posterPublicId: 'id3',
        status: MOVIE_STATUSES.ARCHIVED,
        isDeleted: true,
      });

      // 1. Basic list
      const listRes = await request(app).get('/api/movies');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.items).toHaveLength(2);
      const titles = listRes.body.data.items.map((m) => m.title);
      expect(titles).toContain('Cyberpunk Runner');
      expect(titles).toContain('Comedy Carnival');
      expect(titles).not.toContain('Deleted Phantom');

      // 2. Filter by genre
      const genreRes = await request(app).get('/api/movies?genre=Comedy');
      expect(genreRes.status).toBe(200);
      expect(genreRes.body.data.items).toHaveLength(1);
      expect(genreRes.body.data.items[0].title).toBe('Comedy Carnival');

      // 3. Search query
      const searchRes = await request(app).get('/api/movies?search=Cyberpunk');
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.items).toHaveLength(1);
      expect(searchRes.body.data.items[0].title).toBe('Cyberpunk Runner');
    });

    it('soft delete sets isDeleted: true, status: archived, and hides movie from public', async () => {
      const movie = await Movie.create({
        title: 'Movie To Delete',
        description: 'Temporary movie for testing soft delete',
        genres: ['Drama'],
        languages: ['English'],
        formats: ['2D'],
        durationMin: 100,
        releaseDate: new Date('2026-10-01'),
        certificate: 'UA',
        posterUrl: 'https://example.com/p.jpg',
        posterPublicId: 'pid',
        status: MOVIE_STATUSES.NOW_SHOWING,
        isDeleted: false,
      });

      // Admin soft deletes
      const delRes = await request(app)
        .delete(`/api/admin/movies/${movie._id}`)
        .set('Cookie', adminCookie);

      expect(delRes.status).toBe(200);

      // Verify in DB
      const dbMovie = await Movie.findById(movie._id);
      expect(dbMovie.isDeleted).toBe(true);
      expect(dbMovie.status).toBe(MOVIE_STATUSES.ARCHIVED);

      // Public listing excludes it
      const publicRes = await request(app).get('/api/movies');
      const ids = publicRes.body.data.items.map((m) => m.id);
      expect(ids).not.toContain(movie._id.toString());
    });
  });
});
