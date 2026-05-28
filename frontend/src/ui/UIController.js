/**
 * UIController.js — UI Olay Yöneticisi
 * SOLID: Single Responsibility — Sadece ekran geçişleri ve UI eventleri
 *
 * EventBus'u dinler → DOM'u günceller
 * Hiçbir iş mantığı burada yoktur
 */
class UIController {
  /**
   * @param {typeof EventBus} bus
   * @param {GameEngine} gameEngine
   */
  constructor(bus, gameEngine) {
    this._bus    = bus;
    this._engine = gameEngine;
    this._registerSubscriptions();
  }

  _registerSubscriptions() {
    // Ekran geçişi
    this._bus.subscribe('ui:show-screen', ({ screen }) => {
      if (screen === 'menu-screen') {
        this._updateContinueButton(this._engine.saveData);
      }
      this._showScreen(screen);
    });

    // Auth başarılı → Menü göster, kullanıcı adı yaz
    this._bus.subscribe('auth:login-success', ({ user, save }) => {
      document.getElementById('menu-username').textContent = user.username;

      this._updateContinueButton(save);

      // GameEngine'e save verisini ilet
      this._bus.publish('auth:save-loaded', { save: save || { sceneId: 1 } });
      this._showScreen('menu-screen');
      this._spawnParticles('auth-particles');
    });

    // Seçimler göster
    this._bus.subscribe('game:show-choices', ({ choices }) => {
      this._renderChoices(choices);
    });

    // Seçimleri gizle
    this._bus.subscribe('game:hide-choices', () => {
      this._hideChoices();
    });

    // Kayıt göstergesi
    this._bus.subscribe('ui:save-indicator', () => {
      this._flashSaveIndicator();
    });

    // Bitiş ekranı
    this._bus.subscribe('game:ending', ({ scene }) => {
      this._showEnding(scene);
    });
  }

  // ── Devam Et Butonunu Güncelle ─────────────────────────
  _updateContinueButton(save) {
    const continueBtn  = document.getElementById('btn-continue');
    const sceneLabel   = document.getElementById('continue-scene-label');

    if (save && save.sceneId > 1) {
      continueBtn.classList.remove('hidden');
      sceneLabel.textContent = `Sahne ${save.sceneId}'den devam et`;
    } else {
      continueBtn.classList.add('hidden');
    }
  }

  // ── Ekran Geçişi ──────────────────────────────────────
  _showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (!target) return;
    target.classList.remove('hidden');
    requestAnimationFrame(() => target.classList.add('active'));
  }

  // ── Seçimler ─────────────────────────────────────────
  _renderChoices(choices) {
    const container = document.getElementById('choices-container');
    const cursor    = document.getElementById('dialogue-cursor');
    if (!container) return;

    cursor.style.display = 'none';
    container.innerHTML = '';
    container.classList.remove('hidden');

    choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className  = 'choice-btn';
      btn.id         = `choice-${index}`;
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        this._engine.onChoiceSelected(index);
      });
      container.appendChild(btn);
    });
  }

  _hideChoices() {
    const container = document.getElementById('choices-container');
    if (!container) return;
    container.classList.add('hidden');
    container.innerHTML = '';
  }

  // ── Kayıt Göstergesi ──────────────────────────────────
  _flashSaveIndicator() {
    const el = document.getElementById('save-indicator');
    if (!el) return;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    requestAnimationFrame(() => {
      el.style.animation = 'fade-in-out 2s ease forwards';
    });
    setTimeout(() => el.classList.add('hidden'), 2100);
  }

  // ── Bitiş Ekranı ──────────────────────────────────────
  _showEnding(scene) {
    const badges = { A: '💛', B: '💔', C: '🌸' };
    document.getElementById('ending-badge').textContent = badges[scene.endingType] || '✨';
    document.getElementById('ending-title').textContent = scene.title;
    document.getElementById('ending-text').textContent  = scene.text;
    this._spawnParticles('ending-particles', scene.endingType);
    this._showScreen('ending-screen');
  }

  // ── Parçacık Animasyonu ───────────────────────────────
  _spawnParticles(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const color = type === 'A' ? '#f5c842' : type === 'C' ? '#d4a2e0' : '#e05c7a';

    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --tx: ${(Math.random() - 0.5) * 300}px;
        --ty: ${-100 - Math.random() * 200}px;
        --duration: ${6 + Math.random() * 8}s;
        --delay: ${Math.random() * 3}s;
        background: ${color || '#f5c842'};
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
      `;
      container.appendChild(p);
    }
  }

  // ── Custom Confirm Modal ──────────────────────────────
  showConfirm(message) {
    return new Promise(resolve => {
      const modal = document.getElementById('confirm-modal');
      const msgEl = document.getElementById('confirm-message');
      const btnYes = document.getElementById('confirm-yes');
      const btnNo = document.getElementById('confirm-no');

      if (!modal) return resolve(window.confirm(message)); // Fallback

      msgEl.textContent = message;
      modal.classList.remove('hidden');

      const cleanup = () => {
        modal.classList.add('hidden');
        btnYes.removeEventListener('click', onYes);
        btnNo.removeEventListener('click', onNo);
      };

      const onYes = () => { cleanup(); resolve(true); };
      const onNo = () => { cleanup(); resolve(false); };

      btnYes.addEventListener('click', onYes);
      btnNo.addEventListener('click', onNo);
    });
  }
}
