const pool = require("../config/db");

// Joins the assignee and creator so callers get the assignee's name and both users' teams
// (used for team-leader scope checks) in one query.
// DATE_FORMAT keeps due_date as 'YYYY-MM-DD'; mysql2 would otherwise turn the DATE into a
// local-midnight JS Date that can shift by a day once serialized as UTC JSON.
const TASK_SELECT = `
  SELECT t.id, t.title, t.description, t.status, t.priority,
         t.assigned_to, a.name AS assigned_to_name, a.team_id AS assigned_team_id,
         t.created_by, c.team_id AS creator_team_id,
         DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date, t.created_at
  FROM tasks t
  LEFT JOIN users a ON a.id = t.assigned_to
  LEFT JOIN users c ON c.id = t.created_by`;
const ORDER = " ORDER BY t.created_at DESC, t.id DESC";

async function findAll() {
  const [rows] = await pool.query(TASK_SELECT + ORDER);
  return rows;
}

// Keep in sync with canManageTask in task.controller. A NULL teamId never matches (NULL = NULL is not true).
async function findForLeader(leaderId, teamId) {
  const [rows] = await pool.query(
    TASK_SELECT + " WHERE t.created_by = ? OR t.assigned_to = ? OR a.team_id = ? OR c.team_id = ?" + ORDER,
    [leaderId, leaderId, teamId, teamId]
  );
  return rows;
}

async function findAssignedTo(userId) {
  const [rows] = await pool.query(TASK_SELECT + " WHERE t.assigned_to = ?" + ORDER, [userId]);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(TASK_SELECT + " WHERE t.id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function create({ title, description, status, priority, assignedTo, dueDate, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, status, priority, assignedTo, createdBy, dueDate]
  );
  return findById(result.insertId);
}

async function update(id, { title, description, status, priority, assignedTo, dueDate }) {
  await pool.query(
    `UPDATE tasks
     SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?
     WHERE id = ?`,
    [title, description, status, priority, assignedTo, dueDate, id]
  );
  return findById(id);
}

async function updateStatus(id, status) {
  await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
  return findById(id);
}

async function remove(id) {
  await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
}

module.exports = {
  findAll,
  findForLeader,
  findAssignedTo,
  findById,
  create,
  update,
  updateStatus,
  remove,
};
