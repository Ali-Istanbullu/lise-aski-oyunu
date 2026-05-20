/**
 * StoryService.js — Hikaye veri yönetimi
 * SOLID: Single Responsibility — Sadece hikaye verisi
 * SOLID: Open/Closed — Yeni sahneler registry'e eklenerek genişletilebilir
 */

const STORY_DATA = require('../data/storyData');

class StoryService {
  /**
   * Sahne verisini döner
   * @param {number} sceneId
   * @param {object} choices - Oyuncunun geçmiş seçimleri (dallanma için)
   * @returns {object} Sahne verisi
   */
  getScene(sceneId, choices = {}) {
    const scene = STORY_DATA[sceneId];
    if (!scene) throw new Error(`Sahne bulunamadı: ${sceneId}`);

    return {
      ...scene,
      sceneId,
    };
  }

  /**
   * Bir sonraki sahneyi hesapla
   * @param {number} currentSceneId
   * @param {number} choiceIndex - Yapılan seçim
   * @param {object} choices
   * @returns {{ nextSceneId: number, flags: object }}
   */
  resolveChoice(currentSceneId, choiceIndex, choices = {}) {
    const scene = STORY_DATA[currentSceneId];
    if (!scene) throw new Error(`Sahne bulunamadı: ${currentSceneId}`);

    if (!scene.choices || scene.choices.length === 0) {
      // Linear sahne — bir sonrakine geç
      return {
        nextSceneId: currentSceneId + 1,
        newFlags: {},
      };
    }

    const choice = scene.choices[choiceIndex];
    if (!choice) throw new Error(`Geçersiz seçim: ${choiceIndex}`);

    return {
      nextSceneId: choice.nextScene,
      newFlags: choice.flags || {},
    };
  }

  /**
   * Toplam sahne sayısını döner
   */
  getTotalScenes() {
    return Object.keys(STORY_DATA).length;
  }
}

module.exports = StoryService;
