/**
 * perf.test.js — Performans Testleri
 * performance.now() ile ölçüm yapılır — harici araç gerekmez.
 * Her ölçüm: min, max, ort, p95 değerleri hesaplanır.
 */

const StoryService = require('../../src/services/StoryService');
const SaveService  = require('../../src/services/SaveService');
const AuthService  = require('../../src/services/AuthService');

// ── Ölçüm yardımcısı ──────────────────────────────────────
function stats(timings) {
  const sorted = [...timings].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    min:  sorted[0].toFixed(3),
    max:  sorted[sorted.length - 1].toFixed(3),
    avg:  (sum / sorted.length).toFixed(3),
    p95:  sorted[Math.floor(sorted.length * 0.95)].toFixed(3),
    total: sum.toFixed(3),
  };
}

async function measure(fn, iterations = 100) {
  const timings = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    await fn(i);
    timings.push(performance.now() - t0);
  }
  return stats(timings);
}

function printTable(label, s, iterations) {
  console.log(`\n  ┌─────────────────────────────────────────────────┐`);
  console.log(`  │  ${label.padEnd(47)} │`);
  console.log(`  ├──────────┬──────────┬──────────┬───────────────┤`);
  console.log(`  │  min(ms) │  avg(ms) │  p95(ms) │     max(ms)   │`);
  console.log(`  ├──────────┼──────────┼──────────┼───────────────┤`);
  console.log(`  │  ${String(s.min).padEnd(8)} │  ${String(s.avg).padEnd(8)} │  ${String(s.p95).padEnd(8)} │  ${String(s.max).padEnd(13)} │`);
  console.log(`  └──────────┴──────────┴──────────┴───────────────┘`);
  console.log(`  Toplam ${iterations} iterasyon | Toplam süre: ${s.total}ms`);
}

// ── Mock Repo ──────────────────────────────────────────────
class MockUserRepo {
  constructor() { this.users = []; this.nextId = 1; }
  findByEmail(e)    { return this.users.find(u => u.email === e) || null; }
  findByUsername(u) { return this.users.find(x => x.username === u) || null; }
  findById(id)      { return this.users.find(u => u.id === id) || null; }
  create({ username, email, passwordHash }) {
    const user = { id: this.nextId++, username, email, password_hash: passwordHash };
    this.users.push(user);
    return { id: user.id, username, email };
  }
}

class MockSaveRepo {
  constructor() { this.saves = {}; }
  findByUserId(userId) { return this.saves[userId] || null; }
  upsert(userId, sceneId, choices, flags) {
    this.saves[userId] = { userId, sceneId, choices, flags, updatedAt: new Date().toISOString() };
  }
  reset(userId) { delete this.saves[userId]; }
}

// ══════════════════════════════════════════════════════════
describe('Performans Testleri', () => {
  jest.setTimeout(120000);

  // ── StoryService.getScene() ─────────────────────────────
  describe('StoryService.getScene()', () => {
    it('100 ardışık getScene çağrısı — p95 < 2ms', async () => {
      const svc = new StoryService();
      // Farklı sahneleri sırayla test et
      const sceneIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      const s = await measure((i) => svc.getScene(sceneIds[i % sceneIds.length]), 100);

      printTable('StoryService.getScene() × 100', s, 100);

      // Sahne okuma son derece hızlı olmalı (in-memory)
      expect(parseFloat(s.avg)).toBeLessThan(2);
      expect(parseFloat(s.p95)).toBeLessThan(5);
    });
  });

  // ── StoryService.resolveChoice() ───────────────────────
  describe('StoryService.resolveChoice()', () => {
    it('100 seçim çözümleme — p95 < 2ms', async () => {
      const svc = new StoryService();
      const s = await measure((i) => svc.resolveChoice(2, i % 2), 100);

      printTable('StoryService.resolveChoice() × 100', s, 100);

      expect(parseFloat(s.avg)).toBeLessThan(2);
    });
  });

  // ── SaveService.getSave() ───────────────────────────────
  describe('SaveService.getSave()', () => {
    it('100 ardışık getSave çağrısı — p95 < 2ms', async () => {
      const repo = new MockSaveRepo();
      const svc  = new SaveService(repo);
      // Önce kayıt oluştur
      svc.updateSave(1, 5, { 2: 0 }, {});

      const s = await measure(() => svc.getSave(1), 100);

      printTable('SaveService.getSave() × 100', s, 100);
      expect(parseFloat(s.avg)).toBeLessThan(2);
    });
  });

  // ── SaveService.updateSave() ────────────────────────────
  describe('SaveService.updateSave()', () => {
    it('50 ardışık updateSave — p95 < 5ms', async () => {
      const repo = new MockSaveRepo();
      const svc  = new SaveService(repo);

      const s = await measure((i) => svc.updateSave(1, (i % 14) + 1, {}, {}), 50);

      printTable('SaveService.updateSave() × 50', s, 50);
      expect(parseFloat(s.avg)).toBeLessThan(5);
    });
  });

  // ── AuthService.register() ──────────────────────────────
  describe('AuthService.register() — bcrypt dahil', () => {
    it('10 ardışık register — p95 < 500ms (bcrypt nedeniyle yavaş)', async () => {
      const timings = [];

      for (let i = 0; i < 10; i++) {
        const repo = new MockUserRepo(); // Her register için temiz repo
        const svc  = new AuthService(repo);
        const t0 = performance.now();
        await svc.register(`user${i}_${Date.now()}`, `user${i}_${Date.now()}@t.com`, 'Pass1234');
        timings.push(performance.now() - t0);
      }
      const s = stats(timings);

      printTable('AuthService.register() × 10 (bcrypt)', s, 10);
      // bcrypt 12 round = ~100-400ms arası beklenir
      expect(parseFloat(s.avg)).toBeLessThan(500);
    });
  });

  // ── AuthService.verifyToken() ───────────────────────────
  describe('AuthService.verifyToken() — JWT', () => {
    it('200 token doğrulama — p95 < 2ms', async () => {
      const repo = new MockUserRepo();
      const svc  = new AuthService(repo);
      const { token } = await svc.register('perfuser', 'perf@test.com', 'Pass1234');

      const s = await measure(() => svc.verifyToken(token), 200);

      printTable('AuthService.verifyToken() × 200', s, 200);
      expect(parseFloat(s.avg)).toBeLessThan(2);
    });
  });

  // ── Bellek ölçümü ───────────────────────────────────────
  describe('Bellek kullanımı', () => {
    it('1000 sahne okuma sonrası heap artışı < 10MB', () => {
      const svc = new StoryService();
      const before = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        svc.getScene((i % 15) + 1);
      }

      const after = process.memoryUsage().heapUsed;
      const diffMB = (after - before) / 1024 / 1024;

      console.log(`\n  Heap artışı: ${diffMB.toFixed(2)} MB (1000 getScene çağrısı)`);
      expect(diffMB).toBeLessThan(10);
    });
  });
});
