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
    this._baseUrl = baseUrl.replace(/\/$/, '');
    this._tokenKey = 'lise_aski_token';
  }

  // ── Token ─────────────────────────────────────────────
  getToken()          { return localStorage.getItem(this._tokenKey); }
  setToken(token)     { localStorage.setItem(this._tokenKey, token); }
  clearToken()        { localStorage.removeItem(this._tokenKey); }
  isLoggedIn()        { return !!this.getToken(); }

  // ── Core HTTP ─────────────────────────────────────────
  async request(path, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${this._baseUrl}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
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

  async gameResetSave() {
    return this.request('/api/game/save', { method: 'DELETE' });
  }

  async gameGetScene(sceneId, choices = {}) {
    const q = `?choices=${encodeURIComponent(JSON.stringify(choices))}`;
    return this.request(`/api/game/scene/${sceneId}${q}`);
  }

  async gameMakeChoice(sceneId, choiceIndex, currentChoices = {}) {
    return this.request('/api/game/choice', {
      method: 'POST',
      body: JSON.stringify({ sceneId, choiceIndex, currentChoices }),
    });
  }
}
