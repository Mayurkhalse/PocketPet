const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signJwt } = require("../utils/tokens");
const ApiError = require("../utils/ApiError");

async function register({ email, password, displayName }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "EMAIL_EXISTS", "A user with this email already exists");
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    passwordHash,
    displayName,
  });

  const token = signJwt({ userId: user._id.toString(), email: user.email });
  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = signJwt({ userId: user._id.toString(), email: user.email });
  return { user, token };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }
  return user;
}

module.exports = {
  register,
  login,
  getMe,
};

