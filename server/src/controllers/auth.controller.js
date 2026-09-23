const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const userModel = require("../models/user.model");
const { signAuthToken, generateResetToken, hashResetToken } = require("../utils/token");
const { sendResetPasswordEmail } = require("../config/mailer");

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new AppError("name, email and password are required", 400);
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({ name, email, passwordHash });

    const token = signAuthToken(user);
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signAuthToken(user);
    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
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
