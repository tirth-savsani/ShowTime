import request from 'supertest';
import app from '../app.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import { MOVIE_STATUSES } from '../config/constants.js';

describe('Catalogue Module (Public User Endpoints)', () => {
  describe('Cities', () => {
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
  });

  describe('Movies (Public)', () => {
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
  });
});
