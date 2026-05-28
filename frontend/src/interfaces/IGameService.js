/**
 * IGameService.js — Oyun Servis Sözleşmesi (Interface)
 * SOLID: Interface Segregation — Sadece oyun metodları
 * SOLID: Dependency Inversion — GameEngine bu sözleşmeye bağımlı, somut ApiClient'a değil
 *
 * Implementasyon: GameService.js
 */
const IGameService = {
  /**
   * @returns {Promise<{save: {sceneId, choices, flags}}>}
   */
  getSave: async () => { throw new Error('getSave() implement edilmeli'); },

  /**
   * @param {number} sceneId
   * @param {object} choices
   * @param {object} flags
   * @returns {Promise<void>}
   */
  updateSave: async (sceneId, choices, flags) => { throw new Error('updateSave() implement edilmeli'); },

  /**
   * @returns {Promise<void>}
   */
  resetSave: async () => { throw new Error('resetSave() implement edilmeli'); },

  /**
   * Önbelleği temizle
   */
  clearCache: () => { throw new Error('clearCache() implement edilmeli'); },

  /**
   * @param {number} sceneId
   * @param {object} currentChoices
   * @returns {Promise<{scene: object}>}
   */
  getScene: async (sceneId, currentChoices) => { throw new Error('getScene() implement edilmeli'); },

  /**
   * @param {number} sceneId
   * @param {number} choiceIndex
   * @param {object} currentChoices
   * @returns {Promise<{nextSceneId: number, newFlags: object}>}
   */
  makeChoice: async (sceneId, choiceIndex, currentChoices) => { throw new Error('makeChoice() implement edilmeli'); },
};
