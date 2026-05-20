/**
 * Container.js — IoC (Inversion of Control) Konteyneri
 * SOLID: Dependency Inversion — Yüksek seviyeli modüller somut sınıflara bağımlı OLMAZ
 *
 * KULLANIM:
 *   Container.register('apiClient', () => new ApiClient(config.API_URL));
 *   Container.register('gameService', () => new GameService(Container.resolve('apiClient')));
 *   const gs = Container.resolve('gameService');
 */
const Container = (() => {
  /** @type {Map<string, Function>} factory fonksiyonları */
  const _factories = new Map();
  /** @type {Map<string, *>} singleton örnekler */
  const _instances = new Map();

  /**
   * Bağımlılık kaydet (factory fonksiyon)
   * @param {string} name
   * @param {Function} factory - Singleton oluşturan fonksiyon
   */
  function register(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`[Container] "${name}" için factory fonksiyon gerekli.`);
    }
    _factories.set(name, factory);
    _instances.delete(name); // Factory değişince instance'ı sıfırla
  }

  /**
   * Bağımlılığı çöz (singleton — ilk çağrıda oluşturulur)
   * @param {string} name
   * @returns {*}
   */
  function resolve(name) {
    if (_instances.has(name)) return _instances.get(name);

    const factory = _factories.get(name);
    if (!factory) {
      throw new Error(`[Container] "${name}" kayıtlı değil.`);
    }

    const instance = factory();
    _instances.set(name, instance);
    return instance;
  }

  /**
   * Tüm kayıtları temizle (test için)
   */
  function reset() {
    _factories.clear();
    _instances.clear();
  }

  return { register, resolve, reset };
})();
