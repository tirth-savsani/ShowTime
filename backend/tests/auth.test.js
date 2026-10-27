import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { COOKIE_NAME } from '../config/constants.js';
import bcrypt from 'bcryptjs';

describe('Auth Module (Task 2)', () => {
  const validUser = {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    password: 'Password@123',
    phone: '9876543210',
  };

  const createTestUser = async (overrides = {}) => {
    const passwordHash = await bcrypt.hash(validUser.password, 10);
    return await User.create({
      name: validUser.name,
      email: validUser.email.toLowerCase(),
      passwordHash,
      phone: validUser.phone,
      isActive: true,
      ...overrides,
    });
  };

  describe('POST /api/auth/register', () => {
    it('registers user successfully, sets httpOnly cookie, and returns 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(validUser.name);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check httpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/HttpOnly/i);
    });

    it('returns 409 EMAIL_EXISTS if email is already registered', async () => {
      await createTestUser();

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('EMAIL_EXISTS');
      expect(res.body.message).toContain('already exists');
    });

    it('returns 400 VALIDATION_ERROR when password is weak (<8 chars, no digit/upper/lower)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Smith',
          email: 'bob@example.com',
          password: 'weak',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.errors)).toBe(true);
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).toContain('password');
    });

    it('returns 400 VALIDATION_ERROR when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Smith',
          email: 'not-an-email',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('returns 400 VALIDATION_ERROR when name contains invalid characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '<Script>alert(1)</Script>',
          email: 'script@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.errors.some((e) => e.field === 'name')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('logs in successfully, updates lastLoginAt, and sets httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());
      expect(res.body.data.user.lastLoginAt).toBeDefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/HttpOnly/i);
    });

    it('returns 401 INVALID_CREDENTIALS on wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword@999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 401 INVALID_CREDENTIALS on unknown email (constant-time protection)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown.ghost@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 403 ACCOUNT_DISABLED when isActive is false', async () => {
      await User.updateOne({ email: validUser.email }, { isActive: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('ACCOUNT_DISABLED');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 UNAUTHENTICATED when called without cookie or token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHENTICATED');
    });

    it('returns 200 with user profile when valid cookie is present', async () => {
      await createTestUser();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(validUser.name);
    });

    it('returns 403 ACCOUNT_DISABLED if user was deactivated after token was issued', async () => {
      await createTestUser();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      const cookie = loginRes.headers['set-cookie'];

      // Now deactivate user directly in DB
      await User.updateOne({ email: validUser.email }, { isActive: false });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCOUNT_DISABLED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the auth cookie and returns 200', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/(expires=|Max-Age=0)/i);
    });
  });
});
