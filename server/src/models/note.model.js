const pool = require("../config/db");

// One Quick Notes row per user (user_id is the primary key).
async function findByUserId(userId) {
  const [rows] = await pool.query("SELECT user_id, content, updated_at FROM notes WHERE user_id = ? LIMIT 1", [
    userId,
  ]);
  return rows[0] || null;
}

async function upsert(userId, content) {
  await pool.query(
    "INSERT INTO notes (user_id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
    [userId, content]
  );
  return findByUserId(userId);
}

module.exports = { findByUserId, upsert };
