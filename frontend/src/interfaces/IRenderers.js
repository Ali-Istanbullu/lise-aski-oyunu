/**
 * ISceneRenderer.js — Sahne Render Sözleşmesi (Interface)
 * SOLID: Interface Segregation — Sadece rendering metodları
 *
 * Implementasyon: SceneManager.js
 */
const ISceneRenderer = {
  /**
   * Sahneyi ekrana çiz
   * @param {object} scene
   */
  render: (scene) => { throw new Error('render() implement edilmeli'); },

  /**
   * Karakter anahtarından görünen ismi döner
   * @param {string|null} characterKey
   * @returns {string}
   */
  getSpeakerName: (characterKey) => { throw new Error('getSpeakerName() implement edilmeli'); },
};

/**
 * IDialogueWriter.js — Dialog Yazıcı Sözleşmesi (Interface)
 * SOLID: Interface Segregation — Sadece dialog metodları
 *
 * Implementasyon: DialogueBox.js
 */
const IDialogueWriter = {
  /**
   * Metni typewriter efektiyle göster
   * @param {string} text
   * @param {string} speaker
   * @param {Function|null} onComplete
   */
  show: (text, speaker, onComplete) => { throw new Error('show() implement edilmeli'); },

  /**
   * Yazımı anında tamamla (skip)
   * @returns {boolean} Yazım devam ediyordu mu?
   */
  complete: () => { throw new Error('complete() implement edilmeli'); },

  /**
   * @returns {boolean}
   */
  isTyping: () => { throw new Error('isTyping() implement edilmeli'); },
};
