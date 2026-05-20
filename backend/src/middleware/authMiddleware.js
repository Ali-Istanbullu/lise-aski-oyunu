/**
 * authMiddleware.js — JWT doğrulama middleware
 * SOLID: Single Responsibility — Sadece auth kontrolü
 */

const AuthService = require('../services/AuthService');
const UserRepository = require('../repositories/UserRepository');
const { getDatabase } = require('../config/database');

/**
 * Bearer token doğrulama middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkilendirme gerekli.' });
  }

  const token = authHeader.slice(7);

  try {
    const db = getDatabase();
    const userRepo = new UserRepository(db);
    const authService = new AuthService(userRepo);
    const payload = authService.verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

module.exports = { authenticate };
