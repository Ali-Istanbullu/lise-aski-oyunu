/**
 * SceneManager.js — ISceneRenderer Implementasyonu
 * SOLID: Single Responsibility — Sadece sahne görsel güncellemeleri
 * SOLID: Open/Closed — Yeni background/karakter eklenerek genişletilir (MAPS değişir)
 * SOLID: Dependency Inversion — DOM element ID'leri inject edilir
 *
 * BAĞIMLILIK YOK: EventBus yok, ApiClient yok, GameEngine yok
 */
class SceneManager {
  constructor() {
    // Background → assets/backgrounds/ yolu
    this._backgrounds = {
      corridor:  'assets/backgrounds/corridor.png',
      classroom: 'assets/backgrounds/classroom.png',
      library:   'assets/backgrounds/library.png',
      rainy:     'assets/backgrounds/rainy.png',
    };

    // Character → assets/characters/ yolu
    this._characters = {
      elif:  'assets/characters/elif.png',
      mert:  'assets/characters/mert.png',
      selin: 'assets/characters/selin.png',
    };

    // Karakter görünen isimleri
    this._speakerNames = {
      elif:  'Elif',
      mert:  'Mert',
      selin: 'Selin',
    };
  }

  /**
   * Sahneyi ekrana çiz (ISceneRenderer.render)
   * @param {object} scene
   */
  render(scene) {
    this._updateBackground(scene.background);
    this._updateCharacters(scene.character, scene.characterSide);
    this._updateChapterLabel(scene.title);
    this._updateProgress(scene.sceneId);
  }

  /**
   * Karakter anahtarından görünen isim (ISceneRenderer.getSpeakerName)
   * @param {string|null} characterKey
   * @returns {string}
   */
  getSpeakerName(characterKey) {
    return this._speakerNames[characterKey] || '';
  }

  /**
   * Yeni background kaydı (Open/Closed: extend)
   * @param {string} key
   * @param {string} path
   */
  registerBackground(key, path) {
    this._backgrounds[key] = path;
  }

  /**
   * Yeni karakter kaydı (Open/Closed: extend)
   * @param {string} key
   * @param {string} path
   * @param {string} name
   */
  registerCharacter(key, path, name) {
    this._characters[key] = path;
    this._speakerNames[key] = name;
  }

  // ── Private ───────────────────────────────────────────

  _updateBackground(bgKey) {
    const el = document.getElementById('game-bg');
    if (!el) return;
    const path = this._backgrounds[bgKey] || this._backgrounds.classroom;
    el.style.backgroundImage = `url('${path}')`;
  }

  _updateCharacters(charKey, side) {
    const leftEl  = document.getElementById('char-left');
    const rightEl = document.getElementById('char-right');
    if (!leftEl || !rightEl) return;

    leftEl.classList.add('hidden');
    rightEl.classList.add('hidden');
    leftEl.style.backgroundImage  = '';
    rightEl.style.backgroundImage = '';

    if (!charKey || !this._characters[charKey]) return;

    const target = side === 'left' ? leftEl : rightEl;
    target.style.backgroundImage = `url('${this._characters[charKey]}')`;
    target.classList.remove('hidden');
    target.classList.add('entering');
    setTimeout(() => target.classList.remove('entering'), 600);
  }

  _updateChapterLabel(title) {
    const el = document.getElementById('scene-chapter');
    if (el) el.textContent = title || '';
  }

  _updateProgress(sceneId) {
    const TOTAL = 15;
    const pct = Math.min((sceneId / TOTAL) * 100, 100);
    const bar  = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar)  bar.style.width = `${pct}%`;
    if (text) text.textContent = `${sceneId} / ${TOTAL}`;
  }
}
