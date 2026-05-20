/**
 * database.js — Singleton DB bağlantısı
 * SOLID: Single Responsibility — Sadece veritabanı bağlantısını yönetir
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/game.db');

let instance = null;

/**
 * Singleton DB instance döner. Test ortamında in-memory kullanır.
 * @returns {Database} better-sqlite3 instance
 */
function getDatabase() {
  if (instance) return instance;

  const isTest = process.env.NODE_ENV === 'test';
  const dbPath = isTest ? ':memory:' : DB_PATH;

  if (!isTest) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  instance = new Database(dbPath);
  instance.pragma('journal_mode = WAL');
  instance.pragma('foreign_keys = ON');

  _initSchema(instance);
  return instance;
}

function _initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_saves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scene_id INTEGER NOT NULL DEFAULT 1,
      choices TEXT NOT NULL DEFAULT '{}',
      flags TEXT NOT NULL DEFAULT '{}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    );
  `);
}

/** Test sonrası instance sıfırla */
function resetDatabase() {
  if (instance) {
    instance.close();
    instance = null;
  }
}

module.exports = { getDatabase, resetDatabase };
