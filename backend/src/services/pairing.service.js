const Device = require("../models/Device");
const PairingCode = require("../models/PairingCode");
const { generateDeviceToken, generatePairingCode, sha256 } = require("../utils/tokens");
const ApiError = require("../utils/ApiError");
const { env } = require("../config/env");

async function registerDevice({ hardwareId, fwVersion = "1.0.0" }) {
  let device = await Device.findOne({ hardwareId });

  if (device && device.ownerId) {
    throw new ApiError(
      409,
      "DEVICE_ALREADY_CLAIMED",
      "This device is already paired to an account. Unpair it first."
    );
  }

  const rawToken = generateDeviceToken();
  const tokenHash = sha256(rawToken);

  if (device) {
    device.tokenHash = tokenHash;
    device.status.fwVersion = fwVersion;
    device.status.lastSeenAt = new Date();
    await device.save();
  } else {
    device = await Device.create({
      hardwareId,
      tokenHash,
      status: {
        fwVersion,
        lastSeenAt: new Date(),
      },
    });
  }

  // Generate pairing code
  await PairingCode.deleteMany({ deviceId: device._id });
  const code = generatePairingCode();
  const expiresAt = new Date(Date.now() + env.PAIRING_CODE_TTL_MIN * 60 * 1000);

  await PairingCode.create({
    deviceId: device._id,
    code,
    expiresAt,
    attempts: 0,
  });

  return {
    deviceToken: rawToken,
    pairingCode: code,
    expiresAt,
    pollIntervalSec: device.settings.pollIntervalSec,
  };
}

async function refreshPairingCode(device) {
  if (device.ownerId) {
    throw new ApiError(400, "ALREADY_PAIRED", "Device is already paired with an owner");
  }

  await PairingCode.deleteMany({ deviceId: device._id });
  const code = generatePairingCode();
  const expiresAt = new Date(Date.now() + env.PAIRING_CODE_TTL_MIN * 60 * 1000);

  await PairingCode.create({
    deviceId: device._id,
    code,
    expiresAt,
    attempts: 0,
  });

  return {
    pairingCode: code,
    expiresAt,
  };
}

async function claimDevice({ code, name, userId }) {
  const pairingRecord = await PairingCode.findOne({
    code,
    expiresAt: { $gt: new Date() },
  });

  if (!pairingRecord) {
    throw new ApiError(400, "INVALID_PAIRING_CODE", "Invalid or expired pairing code");
  }

  if (pairingRecord.attempts >= 5) {
    await PairingCode.deleteOne({ _id: pairingRecord._id });
    throw new ApiError(400, "TOO_MANY_ATTEMPTS", "Too many failed attempts. Code expired.");
  }

  const device = await Device.findById(pairingRecord.deviceId);
  if (!device) {
    await PairingCode.deleteOne({ _id: pairingRecord._id });
    throw new ApiError(404, "DEVICE_NOT_FOUND", "Associated device not found");
  }

  if (device.ownerId) {
    await PairingCode.deleteOne({ _id: pairingRecord._id });
    throw new ApiError(409, "DEVICE_ALREADY_CLAIMED", "Device is already claimed");
  }

  device.ownerId = userId;
  device.claimedAt = new Date();
  if (name) {
    device.name = name;
  }

  await device.save();
  await PairingCode.deleteOne({ _id: pairingRecord._id });

  const obj = device.toJSON();
  obj.userRole = "owner";
  return obj;
}

module.exports = {
  registerDevice,
  refreshPairingCode,
  claimDevice,
};

