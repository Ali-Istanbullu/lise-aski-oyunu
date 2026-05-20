/**
 * server.js — Sunucu giriş noktası
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎮 Lise Aşkı Backend — Port ${PORT}`);
  console.log(`📖 Health: http://localhost:${PORT}/health`);
});
