/**
 * AuthService.js — IAuthService Implementasyonu
 * SOLID: Single Responsibility — Sadece auth iş mantığı
 * SOLID: Dependency Inversion — ApiClient inject edilir (somut değil soyut olarak bağımlı)
 * SOLID: Liskov Substitution — IAuthService sözleşmesini tam karşılar
 *
 * EventBus ile haberleşir, kimseyi direkt çağırmaz
 */
class AuthService {
  /**
   * @param {ApiClient} apiClient - Inject edilen HTTP istemcisi
   */
  constructor(apiClient) {
    if (!apiClient) throw new Error('[AuthService] apiClient gerekli.');
    this._api = apiClient;
  }

  /** @returns {boolean} */
  isLoggedIn() {
    return this._api.isLoggedIn();
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string}>}
   */
  async login(email, password) {
    const data = await this._api.authLogin(email, password);
    this._api.setToken(data.token);
    return data;
  }

  /**
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string}>}
   */
  async register(username, email, password) {
    const data = await this._api.authRegister(username, email, password);
    this._api.setToken(data.token);
    return data;
  }

  /** @returns {Promise<void>} */
  async logout() {
    try { await this._api.authLogout(); } catch (_) { /* ignore */ }
    this._api.clearToken();
  }

  /**
   * @returns {Promise<{user: object}|null>}
   */
  async getProfile() {
    if (!this.isLoggedIn()) return null;
    return this._api.authMe();
  }
}
