/**
 * Phase 4 Backend Hardening Integration Tests
 *
 * Verifies:
 * 1. GET /api/movies/sections returns { nowShowing, comingSoon, trending }
 * 2. GET /api/movies/sections?city=... operates correctly
 * 3. GET /api/movies/suggest?q=... provides auto-suggest search
 * 4. GET /api/movies/suggest without q returns 400 VALIDATION_ERROR
 * 5. Memory cache utility behaves correctly with TTL and pattern invalidation
 */

import request from 'supertest';
import app from '../app.js';
import { Movie } from '../models/Movie.js';
import { memoryCache } from '../utils/cache.js';

describe('Backend Hardening (Phase 4)', () => {
  let sampleMovieId;

  beforeEach(async () => {
    // Ensure test movie exists before each test (as afterEach clears collections)
    const movie = await Movie.create({
      title: 'Interstellar Odyssey',
      description: 'A daring expedition into deep cosmic voids beyond the solar system.',
      genres: ['Sci-Fi', 'Adventure'],
      languages: ['English', 'Hindi'],
      formats: ['2D', 'IMAX'],
      durationMin: 165,
      releaseDate: new Date('2026-09-01'),
      certificate: 'UA',
      posterUrl: '/posters/interstellar-odyssey.svg',
      posterPublicId: 'showtime/posters/interstellar-odyssey',
      status: 'now_showing',
      rating: 9.0,
      votes: 150000,
      director: 'Christopher Nolan',
    });
    sampleMovieId = movie._id;
  });

  describe('GET /api/movies/sections', () => {
    it('returns nowShowing, comingSoon, and trending sections', async () => {
      const res = await request(app).get('/api/movies/sections');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.nowShowing)).toBe(true);
      expect(Array.isArray(res.body.data.comingSoon)).toBe(true);
      expect(Array.isArray(res.body.data.trending)).toBe(true);

      if (res.body.data.nowShowing.length > 0) {
        const item = res.body.data.nowShowing[0];
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.posterUrl).toBeDefined();
      }
    });

    it('accepts city query parameter', async () => {
      const res = await request(app).get('/api/movies/sections?city=Mumbai');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/movies/suggest', () => {
    it('returns auto-suggest search matches for query', async () => {
      const res = await request(app).get('/api/movies/suggest?q=Interstellar');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);

      const match = res.body.data.items[0];
      expect(match.title).toContain('Interstellar');
      expect(match.id).toBeDefined();
      expect(match.posterUrl).toBeDefined();
    });

    it('returns 400 VALIDATION_ERROR when query param q is missing', async () => {
      const res = await request(app).get('/api/movies/suggest');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('In-Memory TTL Cache Utility', () => {
    it('correctly stores, retrieves, and invalidates cached data', () => {
      memoryCache.set('test:key1', { foo: 'bar' }, 5);
      expect(memoryCache.get('test:key1')).toEqual({ foo: 'bar' });

      memoryCache.del('test:key1');
      expect(memoryCache.get('test:key1')).toBeNull();

      memoryCache.set('test:batch:1', 'val1', 5);
      memoryCache.set('test:batch:2', 'val2', 5);
      memoryCache.del(/test:batch/);
      expect(memoryCache.get('test:batch:1')).toBeNull();
      expect(memoryCache.get('test:batch:2')).toBeNull();
    });
  });
});
