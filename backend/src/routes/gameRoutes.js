/**
 * gameRoutes.js — Oyun route tanımları
 */

const express = require('express');
const {
  getSave,
  updateSave,
  resetSave,
  getScene,
  makeChoice,
} = require('../controllers/gameController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm oyun endpoint'leri auth gerektirir
router.use(authenticate);

// Kullanıcıya özel veriler — cache yok
router.get('/save', getSave);
router.post('/save', updateSave);
router.delete('/save', resetSave);

// Sahneler statik veridir — 1 saatlik browser cache
router.get('/scene/:id', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  next();
}, getScene);

// Seçim sonuçları dinamik — cache yok
router.post('/choice', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, makeChoice);

module.exports = router;
