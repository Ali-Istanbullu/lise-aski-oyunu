/**
 * UserRepository.js — Kullanıcı veri erişim katmanı
 * SOLID: Single Responsibility — Sadece user CRUD işlemleri
 * SOLID: Dependency Inversion — db inject edilir (test edilebilir)
 */

class UserRepository {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * E-mail ile kullanıcı bul
   * @param {string} email
   * @returns {object|undefined}
   */
  findByEmail(email) {
    return this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);
  }

  /**
   * Username ile kullanıcı bul
   * @param {string} username
   * @returns {object|undefined}
   */
  findByUsername(username) {
    return this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username);
  }

  /**
   * ID ile kullanıcı bul
   * @param {number} id
   * @returns {object|undefined}
   */
  findById(id) {
    return this.db
      .prepare('SELECT id, username, email, created_at FROM users WHERE id = ?')
      .get(id);
  }

  /**
   * Yeni kullanıcı oluştur
   * @param {object} param0
   * @returns {object} Oluşturulan kullanıcı
   */
  create({ username, email, passwordHash }) {
    const stmt = this.db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const result = stmt.run(username, email, passwordHash);
    return this.findById(result.lastInsertRowid);
  }
}

module.exports = UserRepository;
