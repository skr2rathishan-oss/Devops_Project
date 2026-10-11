const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
  return rows[0] || null;
}

// Login accepts either the email or the username in the same field.
async function findByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.query("SELECT * FROM users ORDER BY name, id");
  return rows;
}

// A team leader sees their team plus themselves; a NULL team_id only matches the leader's own row.
async function findByTeamOrId(teamId, userId) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE team_id = ? OR id = ? ORDER BY name, id",
    [teamId, userId]
  );
  return rows;
}

async function create({ name, username, email, passwordHash, role, teamId = null }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, username, email, password, role, team_id) VALUES (?, ?, ?, ?, ?, ?)",
    [name, username, email, passwordHash, role, teamId]
  );
  return findById(result.insertId);
}

async function setResetToken(email, tokenHash, expiresAt) {
  await pool.query(
    "UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE email = ?",
    [tokenHash, expiresAt, email]
  );
}

async function findByResetTokenHash(tokenHash) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE reset_token_hash = ? AND reset_token_expires > NOW() LIMIT 1",
    [tokenHash]
  );
  return rows[0] || null;
}

async function resetPassword(id, passwordHash) {
  await pool.query(
    "UPDATE users SET password = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?",
    [passwordHash, id]
  );
}

module.exports = {
  findByEmail,
  findByUsername,
  findByEmailOrUsername,
  findById,
  findAll,
  findByTeamOrId,
  create,
  setResetToken,
  findByResetTokenHash,
  resetPassword,
};
