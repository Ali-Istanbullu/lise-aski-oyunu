/**
 * smoke.test.js — Smoke Testler
 * Backend'in canlı olduğunu ve kritik akışların çalıştığını doğrular.
 * Bu testler gerçek backend URL'ini kullanır (https://lise-aski-oyunu.onrender.com)
 */

const https = require('https');
const http  = require('http');

const BASE_URL = process.env.SMOKE_URL || 'https://lise-aski-oyunu.onrender.com';
const TIMEOUT_MS = 30000; // cold-start için 30 sn

// ── Basit fetch yardımcısı (node 18+ için native fetch fallback) ──
function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      { hostname: parsed.hostname, port: parsed.port, path: parsed.pathname + parsed.search, method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json', ...options.headers } },
      (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
          catch { resolve({ status: res.statusCode, body }); }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('Timeout')));
    if (options.body) req.write(options.body);
    req.end();
  });
}

function httpPost(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(data);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      { hostname: parsed.hostname, port: parsed.port, path: parsed.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers } },
      (res) => {
        let buf = '';
        res.on('data', d => buf += d);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
          catch { resolve({ status: res.statusCode, body: buf }); }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('Timeout')));
    req.write(body);
    req.end();
  });
}

// Benzersiz test kullanıcısı (her çalışmada farklı)
const TIMESTAMP = Date.now();
const TEST_USER = {
  username: `smokeuser${TIMESTAMP}`,
  email: `smoke_${TIMESTAMP}@test.com`,
  password: 'Smoke1234!',
};

describe('Smoke Tests — Lise Aşkı Backend', () => {
  jest.setTimeout(TIMEOUT_MS + 5000);

  let authToken = '';

  // ── 1. Sağlık Kontrolü ─────────────────────────────────
  describe('1. Health Check', () => {
    it('GET /health → 200 ve status: ok', async () => {
      const res = await httpGet(`${BASE_URL}/health`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.game).toBe('Lise Aşkı');
      console.log(`  ✅ Backend aktif: ${BASE_URL}`);
    });
  });

  // ── 2. Auth Akışı ───────────────────────────────────────
  describe('2. Auth Akışı', () => {
    it('POST /api/auth/register → 201 ve token', async () => {
      const res = await httpPost(`${BASE_URL}/api/auth/register`, TEST_USER);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe(TEST_USER.username);
      authToken = res.body.token;
      console.log(`  ✅ Kullanıcı kaydı başarılı: ${TEST_USER.username}`);
    });

    it('POST /api/auth/login → 200 ve token', async () => {
      const res = await httpPost(`${BASE_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token; // güncelle
      console.log('  ✅ Giriş başarılı');
    });

    it('GET /api/auth/me → 200 ile kullanıcı bilgisi', async () => {
      const res = await httpGet(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe(TEST_USER.username);
      console.log('  ✅ Profil erişimi başarılı');
    });

    it('GET /api/auth/me → 401 token olmadan', async () => {
      const res = await httpGet(`${BASE_URL}/api/auth/me`);
      expect(res.status).toBe(401);
      console.log('  ✅ Yetkisiz erişim engellendi');
    });
  });

  // ── 3. Oyun Akışı ───────────────────────────────────────
  describe('3. Oyun Akışı', () => {
    it('GET /api/game/scene/1 → 200 ilk sahne', async () => {
      const res = await httpGet(`${BASE_URL}/api/game/scene/1`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.body.scene.sceneId).toBe(1);
      console.log('  ✅ Sahne 1 erişilebilir');
    });

    it('GET /api/game/scene/2 → Elif sahnesi döner', async () => {
      const res = await httpGet(`${BASE_URL}/api/game/scene/2`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.body.scene.character).toBe('elif');
      console.log('  ✅ Sahne 2 (Elif) erişilebilir');
    });

    it('GET /api/game/save → 200 ilk kayıt sahne 1', async () => {
      const res = await httpGet(`${BASE_URL}/api/game/save`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.body.save).toBeDefined();
      console.log('  ✅ Kayıt servisi çalışıyor');
    });

    it('POST /api/game/save → 200 kayıt güncelleme', async () => {
      const res = await httpPost(
        `${BASE_URL}/api/game/save`,
        { sceneId: 3, choices: { 2: 0 }, flags: { elifAffection: 1 } },
        { Authorization: `Bearer ${authToken}` }
      );
      expect(res.status).toBe(200);
      console.log('  ✅ Kayıt güncelleme çalışıyor');
    });

    it('POST /api/game/choice → 200 seçim işleme', async () => {
      const res = await httpPost(
        `${BASE_URL}/api/game/choice`,
        { sceneId: 2, choiceIndex: 0, currentChoices: {} },
        { Authorization: `Bearer ${authToken}` }
      );
      expect(res.status).toBe(200);
      expect(res.body.nextSceneId).toBe(3);
      console.log('  ✅ Seçim işleme çalışıyor');
    });

    it('GET /api/game/scene/999 → 404 hata', async () => {
      const res = await httpGet(`${BASE_URL}/api/game/scene/999`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(404);
      console.log('  ✅ Hata yönetimi (404) çalışıyor');
    });
  });
});
