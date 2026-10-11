const AppError = require("./AppError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^\d+$/;

// Route params and ids in bodies arrive as strings or numbers; accept positive integers only.
// Checked by type first because Number() quietly turns "", true and [5] into numbers.
function parseId(value, label) {
  let id = NaN;
  if (typeof value === "number") id = value;
  else if (typeof value === "string" && ID_PATTERN.test(value.trim())) id = Number(value.trim());
  if (!Number.isSafeInteger(id) || id <= 0) throw new AppError(`Invalid ${label}`, 400);
  return id;
}

// The client sends '' for "none" (e.g. Unassigned / No team).
function parseOptionalId(value, label) {
  if (value === undefined || value === null || value === "") return null;
  return parseId(value, label);
}

// Accepts 'YYYY-MM-DD' (what <input type="date"> sends); '' or null clears the date.
function parseOptionalDate(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const str = typeof value === "string" ? value : "";
  const d = new Date(`${str}T00:00:00Z`);
  if (!DATE_PATTERN.test(str) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== str) {
    throw new AppError(`${label} must be a valid date (YYYY-MM-DD)`, 400);
  }
  return str;
}

module.exports = { EMAIL_PATTERN, MIN_PASSWORD_LENGTH, parseId, parseOptionalId, parseOptionalDate };
