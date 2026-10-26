import request from 'supertest';
import app from '../app.js';
import sanitize from '../middlewares/sanitize.js';

describe('Health and System Middleware', () => {
  it('GET /health returns 200 with status, uptime, and time', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('time');
  });

  it('GET non-existent route returns 404 with NOT_FOUND code', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      code: 'NOT_FOUND',
    });
    expect(res.body.message).toContain('Cannot find GET /api/does-not-exist');
  });

  it('Sanitize middleware strips mongo injection operators in-place', () => {
    const req = {
      body: {
        normalField: 'ok',
        $where: 'malicious',
        nested: {
          'bad.field': 'remove',
          goodField: 123,
        },
      },
      query: {
        $gt: '10',
        city: 'Bengaluru',
      },
      params: {
        id: '507f1f77bcf86cd799439011',
      },
    };

    let nextCalled = false;
    sanitize(req, {}, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.body).toEqual({
      normalField: 'ok',
      nested: {
        goodField: 123,
      },
    });
    expect(req.query).toEqual({
      city: 'Bengaluru',
    });
    expect(req.params).toEqual({
      id: '507f1f77bcf86cd799439011',
    });
  });
});
