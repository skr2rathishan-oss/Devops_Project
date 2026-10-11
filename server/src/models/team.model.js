const pool = require("../config/db");

async function findAll() {
  const [rows] = await pool.query("SELECT id, name FROM teams ORDER BY name");
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM teams WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await pool.query("SELECT * FROM teams WHERE name = ? LIMIT 1", [name]);
  return rows[0] || null;
}

async function create(name) {
  const [result] = await pool.query("INSERT INTO teams (name) VALUES (?)", [name]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, findByName, create };
