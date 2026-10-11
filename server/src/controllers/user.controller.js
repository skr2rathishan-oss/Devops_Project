const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const userModel = require("../models/user.model");
const teamModel = require("../models/team.model");
const { toPublicUser } = require("../utils/serializers");
const { EMAIL_PATTERN, MIN_PASSWORD_LENGTH, parseOptionalId } = require("../utils/validators");

// Same bcrypt cost as auth.controller.
const SALT_ROUNDS = 10;
const ROLES = ["admin", "team_leader", "team_member"];

// The admin form doesn't ask for a User ID, so derive one from the email's local part.
async function generateUniqueUsername(email) {
  let base = email.split("@")[0].replace(/[^A-Za-z0-9_.-]/g, "").toLowerCase().slice(0, 40);
  if (base.length < 3) base = `user${base}`; // USERNAME_PATTERN requires 3+ chars
  let candidate = base;
  for (let suffix = 2; await userModel.findByUsername(candidate); suffix += 1) {
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

async function getUsers(req, res, next) {
  try {
    const users =
      req.user.role === "admin"
        ? await userModel.findAll()
        : await userModel.findByTeamOrId(req.user.team_id, req.user.id);
    res.status(200).json(users.map(toPublicUser));
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const body = req.body || {};
    // Non-string values are treated as missing rather than crashing on .trim().
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role || "team_member";

    if (!name || !email || !password) {
      throw new AppError("name, email and password are required", 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError("Please enter a valid email address", 400);
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }
    if (!ROLES.includes(role)) {
      throw new AppError("Role must be admin, team_leader or team_member", 400);
    }

    const teamId = parseOptionalId(body.teamId, "teamId");
    if (teamId !== null && !(await teamModel.findById(teamId))) {
      throw new AppError("Selected team does not exist", 400);
    }
    if (await userModel.findByEmail(email)) {
      throw new AppError("An account with this email already exists", 409);
    }

    const username = await generateUniqueUsername(email);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    let user;
    try {
      user = await userModel.create({ name, username, email, passwordHash, role, teamId });
    } catch (err) {
      // Concurrent requests can race past the checks above.
      if (err.code === "ER_DUP_ENTRY") {
        throw new AppError("An account with this email or User ID already exists", 409);
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        throw new AppError("Selected team does not exist", 400);
      }
      throw err;
    }

    res.status(201).json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, createUser };
