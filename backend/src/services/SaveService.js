/**
 * SaveService.js — Oyun kayıt iş mantığı
 * SOLID: Single Responsibility — Sadece kayıt işlemleri
 * SOLID: Dependency Inversion — saveRepo inject edilir
 */

const TOTAL_SCENES = 15;

class SaveService {
  /**
   * @param {import('../repositories/SaveRepository')} saveRepository
   */
  constructor(saveRepository) {
    this.saveRepository = saveRepository;
  }

  /**
   * Kullanıcının kayıdını getir. Yoksa varsayılan döner.
   * @param {number} userId
   * @returns {object}
   */
  async getSave(userId) {
    const save = await this.saveRepository.findByUserId(userId);
    if (save) return save;

    return {
      userId,
      sceneId: 1,
      choices: {},
      flags: {},
      updatedAt: null,
    };
  }

  /**
   * Oyun ilerlemesini kaydet
   * @param {number} userId
   * @param {number} sceneId
   * @param {object} choices - Yapılan seçimler { sceneId: choiceIndex }
   * @param {object} flags - Oyun bayrakları
   */
  async updateSave(userId, sceneId, choices = {}, flags = {}) {
    this._validateSave(sceneId, choices, flags);
    await this.saveRepository.upsert(userId, sceneId, choices, flags);
    return await this.saveRepository.findByUserId(userId);
  }

  /**
   * Kayıdi sıfırla (yeni oyun)
   * @param {number} userId
   */
  async resetSave(userId) {
    await this.saveRepository.reset(userId);
    return { message: 'Kayıt silindi. Yeni oyun başlatılabilir.' };
  }

  // ---- Private Methods ----

  _validateSave(sceneId, choices, flags) {
    if (!Number.isInteger(sceneId) || sceneId < 1 || sceneId > TOTAL_SCENES + 1) {
      throw new Error(`Geçersiz sahne ID: ${sceneId}`);
    }
    if (typeof choices !== 'object' || Array.isArray(choices)) {
      throw new Error('Seçimler nesne formatında olmalı.');
    }
    if (typeof flags !== 'object' || Array.isArray(flags)) {
      throw new Error('Bayraklar nesne formatında olmalı.');
    }
  }
}

module.exports = SaveService;
