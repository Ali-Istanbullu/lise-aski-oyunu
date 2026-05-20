/**
 * GameService.js — IGameService Implementasyonu
 * SOLID: Single Responsibility — Sadece oyun API iş mantığı
 * SOLID: Dependency Inversion — ApiClient inject edilir
 *
 * GameEngine bu servis üzerinden çalışır, ApiClient'ı direkt tanımaz
 */
class GameService {
  /**
   * @param {ApiClient} apiClient
   */
  constructor(apiClient) {
    if (!apiClient) throw new Error('[GameService] apiClient gerekli.');
    this._api = apiClient;
  }

  /** @returns {Promise<{save: object}>} */
  async getSave() {
    return this._api.gameGetSave();
  }

  /**
   * @param {number} sceneId
   * @param {object} choices
   * @param {object} flags
   */
  async updateSave(sceneId, choices, flags) {
    return this._api.gameUpdateSave(sceneId, choices, flags);
  }

  /** @returns {Promise<void>} */
  async resetSave() {
    return this._api.gameResetSave();
  }

  /**
   * @param {number} sceneId
   * @param {object} currentChoices
   */
  async getScene(sceneId, currentChoices = {}) {
    return this._api.gameGetScene(sceneId, currentChoices);
  }

  /**
   * @param {number} sceneId
   * @param {number} choiceIndex
   * @param {object} currentChoices
   */
  async makeChoice(sceneId, choiceIndex, currentChoices = {}) {
    return this._api.gameMakeChoice(sceneId, choiceIndex, currentChoices);
  }
}
