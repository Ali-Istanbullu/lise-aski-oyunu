/**
 * GameEngine.js — Ana Oyun Motoru
 * SOLID: Single Responsibility — Sadece oyun akış yönetimi
 * SOLID: Dependency Inversion — IGameService, ISceneRenderer, IDialogueWriter inject edilir
 *
 * HİÇBİR GLOBAL BAĞIMLILIK YOK:
 *   ❌ ApiClient — GameService üzerinden
 *   ❌ SceneManager (global) — inject edilmiş renderer üzerinden
 *   ❌ DialogueBox (global) — inject edilmiş writer üzerinden
 *   ✅ EventBus — sadece olay yayımı için
 */
class GameEngine {
  /**
   * @param {GameService} gameService - IGameService impl.
   * @param {SceneManager} sceneRenderer - ISceneRenderer impl.
   * @param {DialogueBox} dialogueWriter - IDialogueWriter impl.
   * @param {typeof EventBus} bus - EventBus (pub/sub)
   */
  constructor(gameService, sceneRenderer, dialogueWriter, bus) {
    this._game     = gameService;
    this._renderer = sceneRenderer;
    this._dialogue = dialogueWriter;
    this._bus      = bus;

    this._state = this._defaultState();
    this._clickHandler = null;

    // EventBus'tan gelen kayıt verisi
    this._bus.subscribe('auth:save-loaded', ({ save }) => {
      this._state.saveData = save;
    });
  }

  _defaultState() {
    return {
      currentSceneId: 1,
      choices: {},
      flags: {},
      waitingForInput: false,
      currentScene: null,
      saveData: null,
    };
  }

  // ── Yeni Oyun ─────────────────────────────────────────
  async startNewGame() {
    if (this._state.saveData?.sceneId > 1) {
      const confirmed = await window._app.showConfirm('Mevcut kayıt silinecek. Yeni oyuna başlamak istediğinden emin misin?');
      if (!confirmed) return;
      try { await this._game.resetSave(); } catch (_) {}
    }
    this._game.clearCache();
    this._bus.publish('game:hide-choices', {});
    this._state = this._defaultState();
    this._bus.publish('ui:show-screen', { screen: 'game-screen' });
    await this._loadScene(1);
  }

  // ── Devam Et ──────────────────────────────────────────
  async continueGame() {
    const save = this._state.saveData;
    if (!save || save.sceneId <= 1) return this.startNewGame();

    this._state.currentSceneId = save.sceneId;
    this._state.choices        = save.choices || {};
    this._state.flags          = save.flags   || {};
    this._bus.publish('ui:show-screen', { screen: 'game-screen' });
    await this._loadScene(save.sceneId);
  }

  get saveData() {
    return this._state.saveData;
  }

  // ── Menüye Dön ────────────────────────────────────────
  goToMenu() {
    this._removeInputListeners();
    this._bus.publish('game:hide-choices', {});
    this._bus.publish('ui:show-screen', { screen: 'menu-screen' });
  }

  // ── Sahne Yükle ───────────────────────────────────────
  async _loadScene(sceneId) {
    this._bus.publish('game:hide-choices', {});
    try {
      const { scene } = await this._game.getScene(sceneId, this._state.choices);
      this._state.currentScene    = scene;
      this._state.currentSceneId  = sceneId;

      this._renderer.render(scene);
      await this._autoSave();

      if (scene.isEnding) {
        this._bus.publish('game:ending', { scene });
        return;
      }

      const speaker = this._renderer.getSpeakerName(scene.character);
      this._state.waitingForInput = false;

      this._dialogue.show(scene.text, speaker, () => {
        this._state.waitingForInput = true;
        if (!scene.choices?.length) {
          this._attachNextListener();
        } else {
          this._bus.publish('game:show-choices', { choices: scene.choices });
        }
      });
    } catch (err) {
      console.error('[GameEngine] Sahne hatası:', err);
      this._dialogue.show('Sahne yüklenemedi. Lütfen tekrar dene.', '⚠️ Hata', null);
    }
  }

  // ── Seçim ─────────────────────────────────────────────
  async onChoiceSelected(choiceIndex) {
    this._bus.publish('game:hide-choices', {});
    try {
      const result = await this._game.makeChoice(
        this._state.currentSceneId,
        choiceIndex,
        this._state.choices
      );
      this._state.choices[this._state.currentSceneId] = choiceIndex;
      if (result.newFlags) Object.assign(this._state.flags, result.newFlags);
      await this._loadScene(result.nextSceneId);
    } catch (err) {
      console.error('[GameEngine] Seçim hatası:', err);
    }
  }

  // ── Otomatik Kayıt ────────────────────────────────────
  async _autoSave() {
    try {
      this._bus.publish('ui:save-indicator', {});
      await this._game.updateSave(
        this._state.currentSceneId,
        this._state.choices,
        this._state.flags
      );
      this._state.saveData = {
        sceneId: this._state.currentSceneId,
        choices: this._state.choices,
        flags: this._state.flags,
      };
    } catch (err) {
      console.warn('[GameEngine] Kayıt hatası:', err);
    }
  }

  // ── Input Dinleyicileri ────────────────────────────────
  _attachNextListener() {
    this._removeInputListeners();

    this._clickHandler = () => {
      if (!this._state.waitingForInput) {
        this._dialogue.complete();
        return;
      }
      this._removeInputListeners();
      const nextId = this._state.currentScene?.next || (this._state.currentSceneId + 1);
      this._loadScene(nextId);
    };

    this._keyHandler = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') this._clickHandler();
    };

    document.getElementById('dialogue-box')?.addEventListener('click', this._clickHandler);
    document.addEventListener('keydown', this._keyHandler);
  }

  _removeInputListeners() {
    if (this._clickHandler) {
      document.getElementById('dialogue-box')?.removeEventListener('click', this._clickHandler);
      this._clickHandler = null;
    }
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  }
}
