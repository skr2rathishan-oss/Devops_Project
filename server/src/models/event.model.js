const pool = require("../config/db");

// DATE_FORMAT/TIME_FORMAT keep the values as plain strings so they never shift with time zones.
const EVENT_SELECT = `
  SELECT id, user_id, title, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
         TIME_FORMAT(event_time, '%H:%i') AS event_time, notes, created_at, updated_at
  FROM calendar_events`;

async function findByUserId(userId) {
  const [rows] = await pool.query(EVENT_SELECT + " WHERE user_id = ? ORDER BY event_date, event_time, id", [userId]);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(EVENT_SELECT + " WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function create({ userId, title, date, time, notes }) {
  const [result] = await pool.query(
    "INSERT INTO calendar_events (user_id, title, event_date, event_time, notes) VALUES (?, ?, ?, ?, ?)",
    [userId, title, date, time, notes]
  );
  return findById(result.insertId);
}

async function update(id, { title, date, time, notes }) {
  await pool.query("UPDATE calendar_events SET title = ?, event_date = ?, event_time = ?, notes = ? WHERE id = ?", [
    title,
    date,
    time,
    notes,
    id,
  ]);
  return findById(id);
}

async function remove(id) {
  await pool.query("DELETE FROM calendar_events WHERE id = ?", [id]);
}

module.exports = { findByUserId, findById, create, update, remove };
