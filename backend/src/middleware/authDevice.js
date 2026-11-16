const { sha256 } = require("../utils/tokens");
const Device = require("../models/Device");
const ApiError = require("../utils/ApiError");

async function authDevice(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "DEVICE_UNAUTHORIZED", "Missing or invalid device authorization token");
    }

    const token = authHeader.split(" ")[1];
    const tokenHash = sha256(token);

    const device = await Device.findOne({ tokenHash });
    if (!device) {
      throw new ApiError(401, "DEVICE_NOT_FOUND", "Device token unrecognized or invalidated");
    }

    req.device = device;
    req.deviceToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authDevice;

