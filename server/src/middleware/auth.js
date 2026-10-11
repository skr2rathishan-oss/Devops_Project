const AppError = require("../utils/AppError");
const userModel = require("../models/user.model");
const { verifyAuthToken } = require("../utils/token");

// Loads the user from the DB (not just the JWT) so role/team changes and deleted accounts take effect immediately.
async function protect(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new AppError("Not authenticated. Please log in.", 401);
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new AppError("Your session is invalid or has expired. Please log in again.", 401);
    }

    const user = await userModel.findById(payload.sub);
    if (!user) {
      throw new AppError("This account no longer exists. Please log in again.", 401);
    }

    req.user = user; // full row, including password hash; always serialize with toPublicUser
    next();
  } catch (err) {
    next(err);
  }
}

// Use after protect, e.g. authorize("admin", "team_leader").
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
}

module.exports = { protect, authorize };
