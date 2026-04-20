const { verifyToken } = require("../utils/jwt");
const { AppError } = require("../utils/appError");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || "cch_token";
    const token =
      (req.cookies && req.cookies[cookieName]) ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice("Bearer ".length)
        : null);

    if (!token) throw new AppError("Not authenticated", 401);

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select("_id name email");
    if (!user) throw new AppError("Not authenticated", 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

