const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function signAuthToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function generateResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

module.exports = { signAuthToken, verifyAuthToken, generateResetToken, hashResetToken };
