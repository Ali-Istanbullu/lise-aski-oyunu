/**
 * app.js — Express uygulama kurulumu
 * SOLID: Single Responsibility — Sadece app konfigürasyonu
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// ── Güvenlik & Parsing ──────────────────────────────────
app.use(helmet());
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://ali-istanbullu.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Postman / server-to-server (origin yok) veya izin verilen kaynak
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: "${origin}" izin verilmedi.`));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', game: 'Lise Aşkı', version: '1.0.0' });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// ── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
