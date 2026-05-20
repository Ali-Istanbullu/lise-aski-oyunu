/**
 * DialogueBox.js — IDialogueWriter Implementasyonu
 * SOLID: Single Responsibility — Sadece dialog animasyonu
 * SOLID: Dependency Inversion — DOM element ID'leri inject edilir
 *
 * BAĞIMLILIK YOK: EventBus yok, ApiClient yok, başka modül yok
 */
class DialogueBox {
  /**
   * @param {object} elements - DOM element ID'leri
   */
  constructor(elements = {}) {
    this._ids = {
      text:    elements.text    || 'dialogue-text',
      speaker: elements.speaker || 'dialogue-speaker',
      cursor:  elements.cursor  || 'dialogue-cursor',
    };
    this._timer = null;
    this._isTyping = false;
    this._fullText = '';
    this._typingSpeed = elements.typingSpeed || 35;
  }

  /**
   * Metni typewriter efektiyle göster (IDialogueWriter.show)
   * @param {string} text
   * @param {string} speaker
   * @param {Function|null} onComplete
   */
  show(text, speaker, onComplete) {
    const textEl    = document.getElementById(this._ids.text);
    const speakerEl = document.getElementById(this._ids.speaker);
    const cursor    = document.getElementById(this._ids.cursor);

    if (!textEl) return;

    speakerEl.textContent = speaker || '';
    textEl.textContent = '';
    cursor.style.display = 'none';

    this._clearTimer();
    this._fullText = text || '';
    this._isTyping = true;

    let index = 0;
    const type = () => {
      if (index < this._fullText.length) {
        textEl.textContent += this._fullText[index++];
        this._timer = setTimeout(type, this._typingSpeed);
      } else {
        this._isTyping = false;
        cursor.style.display = 'block';
        if (typeof onComplete === 'function') onComplete();
      }
    };
    type();
  }

  /**
   * Yazımı anında tamamla (IDialogueWriter.complete)
   * @returns {boolean}
   */
  complete() {
    if (!this._isTyping) return false;
    this._clearTimer();
    document.getElementById(this._ids.text).textContent = this._fullText;
    document.getElementById(this._ids.cursor).style.display = 'block';
    this._isTyping = false;
    return true;
  }

  /** @returns {boolean} */
  isTyping() { return this._isTyping; }

  _clearTimer() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  }
}
