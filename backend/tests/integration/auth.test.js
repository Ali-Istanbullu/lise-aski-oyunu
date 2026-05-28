/**
 * auth.test.js — Integration testler
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../src/app');
const { getDatabase, resetDatabase } = require('../../src/config/database');

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    resetDatabase();
    const db = getDatabase();
    try {
      await db.query("DELETE FROM game_saves WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com' OR username LIKE 'kerem%')");
      await db.query("DELETE FROM users WHERE email LIKE '%@test.com' OR username LIKE 'kerem%'");
    } catch (err) {
      console.warn('[Test Cleanup] Warning during database cleanup:', err.message);
    }
  });

  afterAll(async () => {
    const db = getDatabase();
    try {
      await db.query("DELETE FROM game_saves WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com' OR username LIKE 'kerem%')");
      await db.query("DELETE FROM users WHERE email LIKE '%@test.com' OR username LIKE 'kerem%'");
    } catch (err) {
      // ignore
    }
    await resetDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('201 - Başarılı kayıt', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'kerem', email: 'kerem@test.com', password: 'sifre123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('kerem');
    });

    it('400 - Eksik alan', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'kerem' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('400 - Duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'kerem', email: 'kerem@test.com', password: 'sifre123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'kerem2', email: 'kerem@test.com', password: 'sifre123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'kerem', email: 'kerem@test.com', password: 'sifre123' });
    });

    it('200 - Başarılı giriş', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'kerem@test.com', password: 'sifre123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('401 - Yanlış şifre', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'kerem@test.com', password: 'yanlis' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('200 - Token ile kullanıcı bilgisi', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'kerem', email: 'kerem@test.com', password: 'sifre123' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('kerem');
    });

    it('401 - Token olmadan', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
