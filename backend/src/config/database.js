/**
 * database.js — Singleton PostgreSQL bağlantısı (Supabase)
 * SOLID: Single Responsibility — Sadece veritabanı bağlantısını yönetir
 */
const { Pool } = require('pg');

let pool = null;

/**
 * Singleton DB havuzunu döner.
 * @returns {Pool} pg.Pool instance
 */
function getDatabase() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }

  pool = new Pool({
    connectionString,
    // Supabase gibi harici bağlantılarda SSL genellikle gereklidir.
    // Ancak test ortamlarında devre dışı bırakılabilir.
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  _initSchema(pool);
  return pool;
}

/**
 * Tabloları oluşturur (PostgreSQL formatında)
 * @param {Pool} dbPool 
 */
async function _initSchema(dbPool) {
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_saves (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        scene_id INTEGER NOT NULL DEFAULT 1,
        choices JSONB NOT NULL DEFAULT '{}'::jsonb,
        flags JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  } catch (err) {
    console.error('[DB] Schema initialization error:', err.message);
  }
}

/** Test sonrası instance sıfırla */
async function resetDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getDatabase, resetDatabase };
