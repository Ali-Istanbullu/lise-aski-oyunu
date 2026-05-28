/**
 * SaveRepository.js — Oyun kayıt veri erişim katmanı
 * SOLID: Single Responsibility — Sadece save CRUD işlemleri
 */

class SaveRepository {
  /**
   * @param {import('pg').Pool} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Kullanıcı kayıdını getir
   * @param {number} userId
   * @returns {Promise<object|undefined>}
   */
  async findByUserId(userId) {
    const res = await this.db.query('SELECT * FROM game_saves WHERE user_id = $1', [userId]);
    const row = res.rows[0];

    if (!row) return null;
    return {
      userId: row.user_id,
      sceneId: row.scene_id,
      choices: row.choices,
      flags: row.flags,
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
  async upsert(userId, sceneId, choices, flags) {
    await this.db.query(`
      INSERT INTO game_saves (user_id, scene_id, choices, flags, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        scene_id = EXCLUDED.scene_id,
        choices = EXCLUDED.choices,
        flags = EXCLUDED.flags,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, sceneId, choices, flags]);
  }

  /**
   * Kayıdı sıfırla
   * @param {number} userId
   */
  async reset(userId) {
    await this.db.query('DELETE FROM game_saves WHERE user_id = $1', [userId]);
  }
}

module.exports = SaveRepository;
