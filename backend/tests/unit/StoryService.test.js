/**
 * StoryService.test.js — Unit testler
 * Tüm getScene / resolveChoice / getTotalScenes dalları kapsanır.
 */

const StoryService = require('../../src/services/StoryService');

describe('StoryService', () => {
  let storyService;

  beforeEach(() => {
    storyService = new StoryService();
  });

  // ── getScene() ──────────────────────────────────────────
  describe('getScene()', () => {
    it('var olan sahneyi döner ve sceneId içerir', () => {
      const scene = storyService.getScene(1);
      expect(scene).toHaveProperty('title');
      expect(scene).toHaveProperty('text');
      expect(scene.sceneId).toBe(1);
    });

    it('sahne 1 koridorda başlar (background: corridor)', () => {
      const scene = storyService.getScene(1);
      expect(scene.background).toBe('corridor');
    });

    it('seçenekli sahne choices dizisi döner', () => {
      const scene = storyService.getScene(2);
      expect(Array.isArray(scene.choices)).toBe(true);
      expect(scene.choices.length).toBeGreaterThan(0);
    });

    it('lineer sahne boş choices döner', () => {
      const scene = storyService.getScene(1);
      expect(scene.choices).toEqual([]);
    });

    it('son sahne isEnding: true içerir', () => {
      const scene = storyService.getScene(13);
      expect(scene.isEnding).toBe(true);
      expect(scene.endingType).toBe('A');
    });

    it('B sonu doğru endingType döner', () => {
      const scene = storyService.getScene(14);
      expect(scene.endingType).toBe('B');
    });

    it('C sonu doğru endingType döner', () => {
      const scene = storyService.getScene(15);
      expect(scene.endingType).toBe('C');
    });

    it('var olmayan sahne hata fırlatır', () => {
      expect(() => storyService.getScene(999)).toThrow('Sahne bulunamadı: 999');
    });

    it('sıfır ID ile hata fırlatır', () => {
      expect(() => storyService.getScene(0)).toThrow();
    });

    it('negatif ID ile hata fırlatır', () => {
      expect(() => storyService.getScene(-1)).toThrow();
    });
  });

  // ── resolveChoice() ─────────────────────────────────────
  describe('resolveChoice()', () => {
    it('seçim 0 → doğru nextSceneId döner', () => {
      const result = storyService.resolveChoice(2, 0);
      expect(result).toHaveProperty('nextSceneId');
      expect(result.nextSceneId).toBe(3); // sahne 2, seçim 0 → sahne 3
    });

    it('seçim 1 → doğru nextSceneId döner', () => {
      const result = storyService.resolveChoice(2, 1);
      expect(result.nextSceneId).toBe(3);
    });

    it('seçim 0 ile flag döner', () => {
      const result = storyService.resolveChoice(2, 0);
      expect(result.newFlags).toHaveProperty('elifAffection');
      expect(result.newFlags.elifAffection).toBe(1);
    });

    it('soğuk seçimde negatif affection bayrağı', () => {
      const result = storyService.resolveChoice(2, 1);
      expect(result.newFlags.elifAffection).toBe(-1);
    });

    it('lineer sahne (choices yok) → currentSceneId + 1 döner', () => {
      const result = storyService.resolveChoice(1, 0);
      expect(result.nextSceneId).toBe(2);
    });

    it('var olmayan sahne ID ile hata fırlatır', () => {
      expect(() => storyService.resolveChoice(999, 0)).toThrow('Sahne bulunamadı: 999');
    });

    it('geçersiz seçim indexi ile hata fırlatır', () => {
      expect(() => storyService.resolveChoice(2, 99)).toThrow('Geçersiz seçim: 99');
    });

    it('özür sahnesinde (sahne 10) confessed bayrağı doğru set edilir', () => {
      const result = storyService.resolveChoice(12, 0);
      expect(result.newFlags.confessed).toBe(true);
    });
  });

  // ── getTotalScenes() ─────────────────────────────────────
  describe('getTotalScenes()', () => {
    it('pozitif tam sayı döner', () => {
      const total = storyService.getTotalScenes();
      expect(total).toBeGreaterThan(0);
      expect(Number.isInteger(total)).toBe(true);
    });

    it('15 sahne içerir (3 son dahil)', () => {
      const total = storyService.getTotalScenes();
      expect(total).toBe(15);
    });
  });
});
