const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const userModel = require("../models/user.model");
const { signAuthToken, generateResetToken, hashResetToken } = require("../utils/token");
const { sendResetPasswordEmail } = require("../config/mailer");

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,50}$/;
// Admins can't self-register; they are created by another admin or seeded.
const SELF_REGISTER_ROLES = ["team_member", "team_leader"];

// The shape the client stores as `User` — never includes the password hash.
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    teamId: user.team_id,
  };
}

async function register(req, res, next) {
  try {
    const name = req.body.name?.trim();
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const role = req.body.role || "team_member";

    if (!name || !username || !email || !password) {
      throw new AppError("name, username, email and password are required", 400);
    }
    if (!USERNAME_PATTERN.test(username)) {
      throw new AppError("User ID must be 3-50 characters: letters, numbers, _ . -", 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError("Please enter a valid email address", 400);
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }
    if (!SELF_REGISTER_ROLES.includes(role)) {
      throw new AppError("Role must be team_member or team_leader", 400);
    }

    if (await userModel.findByEmail(email)) {
      throw new AppError("An account with this email already exists", 409);
    }
    if (await userModel.findByUsername(username)) {
      throw new AppError("This User ID is already taken", 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    let user;
    try {
      user = await userModel.create({ name, username, email, passwordHash, role });
    } catch (err) {
      // Two sign-ups racing past the checks above hit the UNIQUE constraints.
      if (err.code === "ER_DUP_ENTRY") {
        throw new AppError("An account with this email or User ID already exists", 409);
      }
      throw err;
    }

    const token = signAuthToken(user);
    res.status(201).json({ success: true, token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    // `identifier` is the email or username; `email` is still accepted for older clients.
    const identifier = (req.body.identifier ?? req.body.email)?.trim();
    const { password } = req.body;
    if (!identifier || !password) {
      throw new AppError("Email or User ID and password are required", 400);
    }

    const user = await userModel.findByEmailOrUsername(identifier);
    if (!user) {
      throw new AppError("Invalid email/User ID or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email/User ID or password", 401);
    }

    const token = signAuthToken(user);
    res.status(200).json({ success: true, token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("email is required", 400);
    }

    const user = await userModel.findByEmail(email);
    // Respond the same way whether or not the user exists, to avoid leaking which emails are registered.
    if (user) {
      const { rawToken, tokenHash } = generateResetToken();
      const expiresMinutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 30;
      const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

      await userModel.setResetToken(email, tokenHash, expiresAt);

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
      await sendResetPasswordEmail(email, resetUrl);
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      throw new AppError("token and password are required", 400);
    }

    const tokenHash = hashResetToken(token);
    const user = await userModel.findByResetTokenHash(tokenHash);
    if (!user) {
      throw new AppError("Reset token is invalid or has expired", 400);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await userModel.resetPassword(user.id, passwordHash);

    res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
