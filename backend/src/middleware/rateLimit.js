const rateLimit = require("express-rate-limit");
const { env } = require("../config/env");

const isTest = env.NODE_ENV === "test";

function createLimiter(options) {
  if (isTest) {
    return (req, res, next) => next();
  }
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests, please try again later" } },
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { code: "AUTH_RATE_LIMIT", message: "Too many authentication attempts, please wait 15 minutes" } },
});

const claimLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { error: { code: "CLAIM_RATE_LIMIT", message: "Too many claim attempts, please wait a minute" } },
});

const registerDeviceLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: { code: "REGISTER_RATE_LIMIT", message: "Too many device registrations from this IP" } },
});

const pollLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30, // 20-30 / min per device token
  keyGenerator: (req) => req.device?._id?.toString() || req.ip,
  message: { error: { code: "POLL_RATE_LIMIT", message: "Polling too frequently" } },
});

const contentSendLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { error: { code: "SEND_RATE_LIMIT", message: "Sending messages too fast" } },
});

module.exports = {
  globalLimiter,
  authLimiter,
  claimLimiter,
  registerDeviceLimiter,
  pollLimiter,
  contentSendLimiter,
};

