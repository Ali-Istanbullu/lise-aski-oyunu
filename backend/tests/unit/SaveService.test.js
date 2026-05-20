/**
 * SaveService.test.js — Unit testler
 */

const SaveService = require('../../src/services/SaveService');

class MockSaveRepository {
  constructor() {
    this.saves = {};
  }
  findByUserId(userId) {
    return this.saves[userId] || null;
  }
  upsert(userId, sceneId, choices, flags) {
    this.saves[userId] = {
      user_id: userId,
      scene_id: sceneId,
      choices: JSON.stringify(choices),
      flags: JSON.stringify(flags),
      updated_at: new Date().toISOString(),
    };
  }
  reset(userId) {
    delete this.saves[userId];
  }
}

// SaveRepository'den dönen verinin parse edilmiş halini simüle et
class MockSaveRepositoryParsed {
  constructor() { this.saves = {}; }
  findByUserId(userId) { return this.saves[userId] || null; }
  upsert(userId, sceneId, choices, flags) {
    this.saves[userId] = { userId, sceneId, choices, flags, updatedAt: new Date().toISOString() };
  }
  reset(userId) { delete this.saves[userId]; }
}

describe('SaveService', () => {
  let saveService;
  let mockRepo;

  beforeEach(() => {
    mockRepo = new MockSaveRepositoryParsed();
    saveService = new SaveService(mockRepo);
  });

  describe('getSave()', () => {
    it('kayıt yoksa varsayılan döner (sahne 1)', () => {
      const save = saveService.getSave(1);
      expect(save.sceneId).toBe(1);
      expect(save.choices).toEqual({});
    });

    it('mevcut kaydı döner', () => {
      saveService.updateSave(1, 5, { 2: 0 }, { elifAffection: 2 });
      const save = saveService.getSave(1);
      expect(save.sceneId).toBe(5);
    });
  });

  describe('updateSave()', () => {
    it('kayıt oluşturur', () => {
      saveService.updateSave(1, 3, { 1: 0 }, {});
      const save = saveService.getSave(1);
      expect(save.sceneId).toBe(3);
    });

    it('geçersiz sahne ID\'de hata fırlatır', () => {
      expect(() => saveService.updateSave(1, 99, {}, {})).toThrow('Geçersiz sahne');
    });

    it('sıfır sahne ID\'de hata fırlatır', () => {
      expect(() => saveService.updateSave(1, 0, {}, {})).toThrow('Geçersiz sahne');
    });

    it('geçersiz choices formatında hata fırlatır', () => {
      expect(() => saveService.updateSave(1, 1, [1, 2], {})).toThrow('Seçimler');
    });
  });

  describe('resetSave()', () => {
    it('kaydı siler', () => {
      saveService.updateSave(1, 5, {}, {});
      saveService.resetSave(1);
      const save = saveService.getSave(1);
      expect(save.sceneId).toBe(1); // Varsayılana dönmeli
    });
  });
});
