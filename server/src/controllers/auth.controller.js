const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const userModel = require("../models/user.model");
const { signAuthToken, generateResetToken, hashResetToken } = require("../utils/token");
const { sendResetPasswordEmail } = require("../config/mailer");
const { toPublicUser } = require("../utils/serializers");
const { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } = require("../utils/validators");

const SALT_ROUNDS = 10;
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,50}$/;
// Admins can't self-register; they are created by another admin or seeded.
const SELF_REGISTER_ROLES = ["team_member", "team_leader"];

// Express 5 leaves req.body undefined when no JSON body is sent, and fields can be any JSON type.
function readString(body, key) {
  const value = body?.[key];
  return typeof value === "string" ? value : "";
}

function assertPasswordLength(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }
}

async function register(req, res, next) {
  try {
    const name = readString(req.body, "name").trim();
    const username = readString(req.body, "username").trim();
    const email = readString(req.body, "email").trim().toLowerCase();
    const password = readString(req.body, "password");
    const role = req.body?.role || "team_member";

    if (!name || !username || !email || !password) {
      throw new AppError("name, username, email and password are required", 400);
    }
    // Match the VARCHAR sizes in database/init.sql so MySQL never rejects the insert.
    if (name.length > 100) {
      throw new AppError("Name must be at most 100 characters", 400);
    }
    if (email.length > 255) {
      throw new AppError("Email must be at most 255 characters", 400);
    }
    if (!USERNAME_PATTERN.test(username)) {
      throw new AppError("User ID must be 3-50 characters: letters, numbers, _ . -", 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError("Please enter a valid email address", 400);
    }
    assertPasswordLength(password);
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
    const identifier = (readString(req.body, "identifier") || readString(req.body, "email")).trim();
    const password = readString(req.body, "password");
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
    // Stored emails are lowercased at registration.
    const email = readString(req.body, "email").trim().toLowerCase();
    if (!email) {
      throw new AppError("email is required", 400);
    }

    const user = await userModel.findByEmail(email);
    // Respond the same way whether or not the user exists, to avoid leaking which emails are registered.
    if (user) {
      const { rawToken, tokenHash } = generateResetToken();
      const expiresMinutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 30;
      const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

      await userModel.setResetToken(user.email, tokenHash, expiresAt);

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
      try {
        await sendResetPasswordEmail(user.email, resetUrl);
      } catch (err) {
        // A 500 here only for existing accounts would reveal which emails are registered.
        console.error("Failed to send password reset email:", err);
      }
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
    const password = readString(req.body, "password");
    if (!token || !password) {
      throw new AppError("token and password are required", 400);
    }
    assertPasswordLength(password);

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

// req.user is set by the protect middleware.
async function me(req, res, next) {
  try {
    res.status(200).json({ success: true, user: toPublicUser(req.user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, forgotPassword, resetPassword, me };
