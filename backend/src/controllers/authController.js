/**
 * authController.js — Auth HTTP handler
 * SOLID: Single Responsibility — Sadece HTTP katmanı (iş mantığı AuthService'te)
 */

const AuthService = require('../services/AuthService');
const UserRepository = require('../repositories/UserRepository');
const { getDatabase } = require('../config/database');

function _getAuthService() {
  const db = getDatabase();
  const userRepo = new UserRepository(db);
  return new AuthService(userRepo);
}

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const authService = _getAuthService();
    const result = await authService.register(username, email, password);
    res.status(201).json({ message: 'Kayıt başarılı!', ...result });
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const authService = _getAuthService();
    const result = await authService.login(email, password);
    res.status(200).json({ message: 'Giriş başarılı!', ...result });
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.status(200).json({ message: 'Çıkış yapıldı.' });
}

/**
 * GET /api/auth/me
 */
function me(req, res, next) {
  try {
    const db = getDatabase();
    const userRepo = new UserRepository(db);
    const user = userRepo.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
