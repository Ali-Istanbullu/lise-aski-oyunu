/**
 * game.test.js — Game API integration testler
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase } = require('../../src/config/database');

describe('Game Integration Tests', () => {
  let token;

  beforeEach(async () => {
    resetDatabase();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'kerem', email: 'kerem@test.com', password: 'sifre123' });
    token = res.body.token;
  });

  afterAll(() => {
    resetDatabase();
  });

  describe('GET /api/game/save', () => {
    it('200 - Yeni oyuncu için varsayılan kayıt (sahne 1)', async () => {
      const res = await request(app)
        .get('/api/game/save')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.save.sceneId).toBe(1);
    });

    it('401 - Token olmadan', async () => {
      const res = await request(app).get('/api/game/save');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/game/save', () => {
    it('200 - Kayıt güncelleme', async () => {
      const res = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${token}`)
        .send({ sceneId: 5, choices: { 2: 0 }, flags: { elifAffection: 2 } });

      expect(res.status).toBe(200);
      expect(res.body.save.sceneId).toBe(5);
    });

    it('400 - Geçersiz sahne ID', async () => {
      const res = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${token}`)
        .send({ sceneId: 99, choices: {}, flags: {} });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/game/scene/:id', () => {
    it('200 - Sahne 1 getir', async () => {
      const res = await request(app)
        .get('/api/game/scene/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.scene.sceneId).toBe(1);
      expect(res.body.scene).toHaveProperty('text');
    });

    it('404 - Olmayan sahne', async () => {
      const res = await request(app)
        .get('/api/game/scene/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/game/choice', () => {
    it('200 - Seçim çözümleme', async () => {
      const res = await request(app)
        .post('/api/game/choice')
        .set('Authorization', `Bearer ${token}`)
        .send({ sceneId: 2, choiceIndex: 0, currentChoices: {} });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nextSceneId');
    });
  });
});
