/**
 * AuthManager.js — Auth UI Yöneticisi
 * SOLID: Single Responsibility — Sadece auth form UI
 * SOLID: Dependency Inversion — AuthService inject edilir
 *
 * EventBus ile yayın yapar → kimseyi direkt çağırmaz
 */
class AuthManager {
  /**
   * @param {AuthService} authService
   * @param {typeof EventBus} bus
   */
  constructor(authService, bus) {
    this._auth = authService;
    this._bus  = bus;
  }

  // ── Tab Switcher ──────────────────────────────────────
  showTab(tab) {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin     = document.getElementById('tab-login');
    const tabRegister  = document.getElementById('tab-register');

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
    } else {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
    }
    this._clearErrors();
  }

  // ── Kayıt ─────────────────────────────────────────────
  async handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email    = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const btn      = document.getElementById('register-btn');

    this._clearErrors();
    this._setLoading(btn, true);

    let errorMsg = null;
    try {
      const result = await this._auth.register(username, email, password);
      await this._onAuthSuccess(result.user);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      this._setLoading(btn, false);
      if (errorMsg) this._showError('register-error', errorMsg);
    }
  }

  // ── Giriş ─────────────────────────────────────────────
  async handleLogin(event) {
    event.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');

    this._clearErrors();
    this._setLoading(btn, true);

    let errorMsg = null;
    try {
      const result = await this._auth.login(email, password);
      await this._onAuthSuccess(result.user);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      this._setLoading(btn, false);
      if (errorMsg) this._showError('login-error', errorMsg);
    }
  }

  // ── Çıkış ─────────────────────────────────────────────
  async logout() {
    await this._auth.logout();
    this._bus.publish('ui:show-screen', { screen: 'auth-screen' });
  }

  // ── Oturum Kontrolü ───────────────────────────────────
  async checkSession() {
    if (!this._auth.isLoggedIn()) return false;
    try {
      const result = await this._auth.getProfile();
      if (!result?.user) return false;
      await this._onAuthSuccess(result.user);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private ───────────────────────────────────────────

  async _onAuthSuccess(user) {
    // Kayıt bilgisini çek
    let save = null;
    try {
      // GameService'i Container'dan al (direkt bağımlılık yok)
      const gameService = Container.resolve('gameService');
      const saveData = await gameService.getSave();
      save = saveData.save;
    } catch (_) {}

    // EventBus üzerinden yay — GameEngine, MenuUI dinler
    this._bus.publish('auth:login-success', { user, save });
  }

  _setLoading(btn, loading) {
    btn.querySelector('.btn-text').classList.toggle('hidden', loading);
    btn.querySelector('.btn-loading').classList.toggle('hidden', !loading);
    btn.disabled = loading;
  }

  _showError(id, message) {
    const el = document.getElementById(id);
    if (el) { el.textContent = message; el.classList.remove('hidden'); }
  }

  _clearErrors() {
    document.querySelectorAll('.form-error').forEach(e => e.classList.add('hidden'));
  }
}
