const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function generateDeviceToken() {
  return crypto.randomBytes(32).toString("hex"); // 64 hex characters
}

function generatePairingCode() {
  // 6 digits (100000 - 999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateInviteCode() {
  // 8 uppercase alphanumeric characters, avoiding ambiguous ones (e.g. 0, O, 1, I)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

function signJwt(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_TTL });
}

function verifyJwt(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = {
  sha256,
  generateDeviceToken,
  generatePairingCode,
  generateInviteCode,
  signJwt,
  verifyJwt,
};

