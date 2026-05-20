/**
 * config.js — Frontend Konfigürasyonu
 * SOLID: Single Responsibility — Sadece konfigürasyon verisi
 * Tüm modüller bu config'den okur, direkt URL yazmaz
 */
window.APP_CONFIG = {
  // Backend Render URL — deploy sonrası burası güncellenir
  // Lokal test: 'http://localhost:3000'
  API_URL: 'https://lise-aski-backend.onrender.com',
};
