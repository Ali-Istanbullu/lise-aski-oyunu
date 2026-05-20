/**
 * IAuthService.js — Auth Servis Sözleşmesi (Interface)
 * SOLID: Interface Segregation — Sadece auth metodları
 * SOLID: Dependency Inversion — Somut sınıf değil, sözleşme kullanılır
 *
 * Implementasyon: AuthService.js
 * Kullanım: GameEngine, AuthManager bu interface'e bağımlı
 */
const IAuthService = {
  /**
   * Kullanıcı girişi
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string}>}
   */
  login: async (email, password) => { throw new Error('login() implement edilmeli'); },

  /**
   * Yeni kayıt
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string}>}
   */
  register: async (username, email, password) => { throw new Error('register() implement edilmeli'); },

  /**
   * Çıkış
   * @returns {Promise<void>}
   */
  logout: async () => { throw new Error('logout() implement edilmeli'); },

  /**
   * Mevcut oturumu doğrula
   * @returns {Promise<{user: object}|null>}
   */
  getProfile: async () => { throw new Error('getProfile() implement edilmeli'); },

  /**
   * Token var mı?
   * @returns {boolean}
   */
  isLoggedIn: () => { throw new Error('isLoggedIn() implement edilmeli'); },
};
