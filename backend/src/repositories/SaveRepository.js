/**
 * SaveRepository.js — Oyun kayıt veri erişim katmanı
 * SOLID: Single Responsibility — Sadece save CRUD işlemleri
 */

class SaveRepository {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Kullanıcı kayıdını getir
   * @param {number} userId
   * @returns {object|undefined}
   */
  findByUserId(userId) {
    const row = this.db
      .prepare('SELECT * FROM game_saves WHERE user_id = ?')
      .get(userId);

    if (!row) return null;
    return {
      userId: row.user_id,
      sceneId: row.scene_id,
      choices: JSON.parse(row.choices),
      flags: JSON.parse(row.flags),
      updatedAt: row.updated_at,
    };
  }

  /**
   * Kayıt oluştur veya güncelle (UPSERT)
   * @param {number} userId
   * @param {number} sceneId
   * @param {object} choices
   * @param {object} flags
   */
  upsert(userId, sceneId, choices, flags) {
    const stmt = this.db.prepare(`
      INSERT INTO game_saves (user_id, scene_id, choices, flags, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        scene_id = excluded.scene_id,
        choices = excluded.choices,
        flags = excluded.flags,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(userId, sceneId, JSON.stringify(choices), JSON.stringify(flags));
  }

  /**
   * Kayıdi sıfırla
   * @param {number} userId
   */
  reset(userId) {
    this.db
      .prepare('DELETE FROM game_saves WHERE user_id = ?')
      .run(userId);
  }
}

module.exports = SaveRepository;
