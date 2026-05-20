/**
 * app.js — Composition Root (Bileşim Kökü)
 * SOLID: Dependency Inversion — TÜM bağımlılıklar burada çözümlenir
 *
 * Bu dosya dışında hiçbir yer:
 *   - new ApiClient() yapmaz
 *   - new GameEngine() yapmaz
 *   - Container.register() yapmaz
 *
 * HTML eventleri (onclick) buraya bağlanır → global değişken yerine bridge fonksiyonları
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.APP_CONFIG;

  // ── 1. Altyapı katmanı ────────────────────────────────
  Container.register('apiClient', () => new ApiClient(config.API_URL));

  // ── 2. Servis katmanı ─────────────────────────────────
  Container.register('authService', () =>
    new AuthService(Container.resolve('apiClient'))
  );
  Container.register('gameService', () =>
    new GameService(Container.resolve('apiClient'))
  );

  // ── 3. Engine/Renderer katmanı ────────────────────────
  Container.register('dialogueBox', () => new DialogueBox());
  Container.register('sceneManager', () => new SceneManager());

  Container.register('gameEngine', () =>
    new GameEngine(
      Container.resolve('gameService'),
      Container.resolve('sceneManager'),
      Container.resolve('dialogueBox'),
      EventBus
    )
  );

  // ── 4. Auth Manager ───────────────────────────────────
  Container.register('authManager', () =>
    new AuthManager(Container.resolve('authService'), EventBus)
  );

  // ── 5. UI Controller (EventBus dinleyicisi) ───────────
  Container.register('uiController', () =>
    new UIController(EventBus, Container.resolve('gameEngine'))
  );

  // ── 6. Tüm container'ı başlat ────────────────────────
  Container.resolve('uiController');   // EventBus'a subscribe olur
  const authManager = Container.resolve('authManager');

  // ── 7. HTML onclick bridge'leri ───────────────────────
  // HTML'den gelen çağrılar → doğru instance'a yönlenir
  window._app = {
    showTab:        (tab)   => authManager.showTab(tab),
    handleLogin:    (e)     => authManager.handleLogin(e),
    handleRegister: (e)     => authManager.handleRegister(e),
    logout:         ()      => authManager.logout(),
    startNewGame:   ()      => Container.resolve('gameEngine').startNewGame(),
    continueGame:   ()      => Container.resolve('gameEngine').continueGame(),
    goToMenu:       ()      => Container.resolve('gameEngine').goToMenu(),
  };

  // ── 8. Parçacık animasyonu başlat ────────────────────
  _spawnAuthParticles();

  // ── 9. Otomatik oturum kontrolü ───────────────────────
  authManager.checkSession();
});

function _spawnAuthParticles() {
  const container = document.getElementById('auth-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --tx: ${(Math.random() - 0.5) * 200}px;
      --ty: ${-50 - Math.random() * 150}px;
      --duration: ${5 + Math.random() * 8}s;
      --delay: ${Math.random() * 4}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
    `;
    container.appendChild(p);
  }
}
