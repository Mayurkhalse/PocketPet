const { verifyJwt } = require("../utils/tokens");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function authUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing or invalid authorization token");
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid or expired token");
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, "USER_NOT_FOUND", "User associated with token no longer exists");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authUser;

