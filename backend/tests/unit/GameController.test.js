/**
 * GameController.test.js — Unit testler (HTTP katmanı mock ile)
 * supertest ile Express endpoint'leri token gerektirmeden test edilir.
 * Auth middleware mock'lanır → sadece controller mantığı test edilir.
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');

// ── Mock bağımlılıklar ─────────────────────────────────────
jest.mock('../../src/config/database', () => ({
  getDatabase: jest.fn(() => ({})),
  resetDatabase: jest.fn(),
}));

jest.mock('../../src/repositories/SaveRepository', () => {
  return jest.fn().mockImplementation(() => ({
    findByUserId: jest.fn(() => null),
    upsert: jest.fn(),
    reset: jest.fn(),
  }));
});

// ── Test app (auth middleware bypass) ─────────────────────
const gameController = require('../../src/controllers/gameController');

function buildTestApp() {
  const app = express();
  app.use(express.json());

  // Auth middleware mock — her isteği userId:1 olarak işaret et
  app.use((req, _res, next) => {
    req.userId = 1;
    next();
  });

  app.get('/api/game/save',    gameController.getSave);
  app.post('/api/game/save',   gameController.updateSave);
  app.delete('/api/game/save', gameController.resetSave);
  app.get('/api/game/scene/:id', gameController.getScene);
  app.post('/api/game/choice', gameController.makeChoice);

  // Hata middleware
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ error: err.message });
  });

  return app;
}

describe('GameController', () => {
  let app;

  beforeEach(() => {
    app = buildTestApp();
  });

  // ── GET /api/game/save ──────────────────────────────────
  describe('GET /api/game/save', () => {
    it('200 — kayıt yoksa varsayılan sahne 1 döner', async () => {
      const res = await request(app).get('/api/game/save');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('save');
      expect(res.body.save.sceneId).toBe(1);
    });
  });

  // ── POST /api/game/save ─────────────────────────────────
  describe('POST /api/game/save', () => {
    it('200 — geçerli save günceller', async () => {
      const res = await request(app)
        .post('/api/game/save')
        .send({ sceneId: 3, choices: { 2: 0 }, flags: {} });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('400 — geçersiz sceneId (sıfır) hata döner', async () => {
      const res = await request(app)
        .post('/api/game/save')
        .send({ sceneId: 0, choices: {}, flags: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('400 — geçersiz sceneId (çok büyük) hata döner', async () => {
      const res = await request(app)
        .post('/api/game/save')
        .send({ sceneId: 999, choices: {}, flags: {} });
      expect(res.status).toBe(400);
    });

    it('400 — choices dizi olunca hata döner', async () => {
      const res = await request(app)
        .post('/api/game/save')
        .send({ sceneId: 1, choices: [0, 1], flags: {} });
      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/game/save ───────────────────────────────
  describe('DELETE /api/game/save', () => {
    it('200 — kayıt sıfırlar ve mesaj döner', async () => {
      const res = await request(app).delete('/api/game/save');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ── GET /api/game/scene/:id ─────────────────────────────
  describe('GET /api/game/scene/:id', () => {
    it('200 — sahne 1 başarıyla döner', async () => {
      const res = await request(app).get('/api/game/scene/1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('scene');
      expect(res.body.scene.sceneId).toBe(1);
    });

    it('200 — sahne 2 karakter içerir', async () => {
      const res = await request(app).get('/api/game/scene/2');
      expect(res.status).toBe(200);
      expect(res.body.scene.character).toBe('elif');
    });

    it('200 — son sahne (13) isEnding: true döner', async () => {
      const res = await request(app).get('/api/game/scene/13');
      expect(res.status).toBe(200);
      expect(res.body.scene.isEnding).toBe(true);
    });

    it('404 — var olmayan sahne ID', async () => {
      const res = await request(app).get('/api/game/scene/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('200 — choices query parametresi ile sahne döner', async () => {
      const choices = encodeURIComponent(JSON.stringify({ 2: 0 }));
      const res = await request(app).get(`/api/game/scene/3?choices=${choices}`);
      expect(res.status).toBe(200);
    });
  });

  // ── POST /api/game/choice ───────────────────────────────
  describe('POST /api/game/choice', () => {
    it('200 — geçerli seçim nextSceneId döner', async () => {
      const res = await request(app)
        .post('/api/game/choice')
        .send({ sceneId: 2, choiceIndex: 0, currentChoices: {} });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nextSceneId');
    });

    it('200 — seçim flagleri içerir', async () => {
      const res = await request(app)
        .post('/api/game/choice')
        .send({ sceneId: 2, choiceIndex: 0, currentChoices: {} });
      expect(res.body).toHaveProperty('newFlags');
    });

    it('400 — geçersiz sahne ID ile hata', async () => {
      const res = await request(app)
        .post('/api/game/choice')
        .send({ sceneId: 999, choiceIndex: 0, currentChoices: {} });
      expect(res.status).toBe(400);
    });

    it('400 — geçersiz seçim indexi ile hata', async () => {
      const res = await request(app)
        .post('/api/game/choice')
        .send({ sceneId: 2, choiceIndex: 99, currentChoices: {} });
      expect(res.status).toBe(400);
    });

    it('200 — currentChoices olmadan da çalışır', async () => {
      const res = await request(app)
        .post('/api/game/choice')
        .send({ sceneId: 2, choiceIndex: 1 });
      expect(res.status).toBe(200);
    });
  });
});
