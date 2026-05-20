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

router.get('/save', getSave);
router.post('/save', updateSave);
router.delete('/save', resetSave);
router.get('/scene/:id', getScene);
router.post('/choice', makeChoice);

module.exports = router;
