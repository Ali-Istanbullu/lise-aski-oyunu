/**
 * ApiClient.js — Ham HTTP İstemcisi
 * SOLID: Single Responsibility — SADECE HTTP istekleri, sıfır iş mantığı
 * SOLID: Dependency Inversion — URL dışarıdan inject edilir
 *
 * Bu sınıf kimseyi tanımaz: EventBus yok, DOM yok, global yok
 */
class ApiClient {
  /**
   * @param {string} baseUrl - Backend URL (inject edilir)
   */
  constructor(baseUrl) {
    if (!baseUrl) throw new Error('[ApiClient] baseUrl gerekli.');
    this._baseUrl  = baseUrl.replace(/\/$/, '');
    this._tokenKey = 'lise_aski_token';
    // In-memory sahne cache — sahneler statik, session boyunca tutulur
    this._sceneCache = new Map();
  }

  // ── Token ─────────────────────────────────────────────────────
  getToken()          { return localStorage.getItem(this._tokenKey); }
  setToken(token)     { localStorage.setItem(this._tokenKey, token); }
  clearToken()        { localStorage.removeItem(this._tokenKey); this._sceneCache.clear(); }
  isLoggedIn()        { return !!this.getToken(); }

  // ── Core HTTP ─────────────────────────────────────────
  async request(path, options = {}, timeoutMs = 20000) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res  = await fetch(`${this._baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(
          'Sunucu yanıt vermedi. Sunucu uyku modundan uyanıyor olabilir — ' +
          'lütfen birkaç saniye bekleyip tekrar dene.'
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ── Auth Endpoints ────────────────────────────────────
  async authRegister(username, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async authLogin(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async authLogout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async authMe() {
    return this.request('/api/auth/me');
  }

  // ── Game Endpoints ────────────────────────────────────
  async gameGetSave() {
    return this.request('/api/game/save');
  }

  async gameUpdateSave(sceneId, choices, flags) {
    return this.request('/api/game/save', {
      method: 'POST',
      body: JSON.stringify({ sceneId, choices, flags }),
    });
  }

  clearSceneCache() {
    this._sceneCache.clear();
  }

  async gameResetSave() {
    this.clearSceneCache();
    return this.request('/api/game/save', { method: 'DELETE' });
  }

  async gameGetScene(sceneId, choices = {}) {
    const choicesKey = JSON.stringify(choices);
    const cacheKey = `scene_${sceneId}_${choicesKey}`;
    // Cache hit — anında dön
    if (this._sceneCache.has(cacheKey)) {
      return this._sceneCache.get(cacheKey);
    }
    const q = `?choices=${encodeURIComponent(choicesKey)}`;
    const data = await this.request(`/api/game/scene/${sceneId}${q}`);
    // Cache'e yaz
    this._sceneCache.set(cacheKey, data);
    return data;
  }

  async gameMakeChoice(sceneId, choiceIndex, currentChoices = {}) {
    return this.request('/api/game/choice', {
      method: 'POST',
      body: JSON.stringify({ sceneId, choiceIndex, currentChoices }),
    });
  }
}
