/**
 * EventBus.js — Merkezi Olay Yöneticisi
 * SOLID: Single Responsibility — Sadece pub/sub yönetimi
 * SOLID: Dependency Inversion — Modüller birbirini çağırmaz, event yayar/dinler
 *
 * KULLANIM:
 *   EventBus.subscribe('auth:login', (data) => { ... });
 *   EventBus.publish('auth:login', { user, save });
 */
const EventBus = (() => {
  /** @type {Map<string, Set<Function>>} */
  const _listeners = new Map();

  /**
   * Olayı dinle
   * @param {string} event - Olay adı (örn: 'auth:login')
   * @param {Function} handler
   * @returns {Function} unsubscribe fonksiyonu
   */
  function subscribe(event, handler) {
    if (!_listeners.has(event)) {
      _listeners.set(event, new Set());
    }
    _listeners.get(event).add(handler);

    // Unsubscribe fonksiyonu döner
    return () => _listeners.get(event)?.delete(handler);
  }

  /**
   * Olayı yayınla
   * @param {string} event
   * @param {*} data
   */
  function publish(event, data) {
    const handlers = _listeners.get(event);
    if (!handlers) return;
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`[EventBus] "${event}" handler hatası:`, err);
      }
    });
  }

  /**
   * Tüm dinleyicileri temizle (test için)
   */
  function clear() {
    _listeners.clear();
  }

  return { subscribe, publish, clear };
})();
