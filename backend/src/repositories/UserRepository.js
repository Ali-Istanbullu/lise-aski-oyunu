/**
 * UserRepository.js — Kullanıcı veri erişim katmanı
 * SOLID: Single Responsibility — Sadece user CRUD işlemleri
 * SOLID: Dependency Inversion — db havuzu inject edilir (test edilebilir)
 */

class UserRepository {
  /**
   * @param {import('pg').Pool} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * E-mail ile kullanıcı bul
   * @param {string} email
   * @returns {Promise<object|undefined>}
   */
  async findByEmail(email) {
    const res = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  /**
   * Username ile kullanıcı bul
   * @param {string} username
   * @returns {Promise<object|undefined>}
   */
  async findByUsername(username) {
    const res = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
  }

  /**
   * ID ile kullanıcı bul
   * @param {number} id
   * @returns {Promise<object|undefined>}
   */
  async findById(id) {
    const res = await this.db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0];
  }

  /**
   * Yeni kullanıcı oluştur
   * @param {object} param0
   * @returns {Promise<object>} Oluşturulan kullanıcı
   */
  async create({ username, email, passwordHash }) {
    const res = await this.db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );
    return res.rows[0];
  }
}

module.exports = UserRepository;
