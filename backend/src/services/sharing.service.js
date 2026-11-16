const Invite = require("../models/Invite");
const Device = require("../models/Device");
const { getDeviceAccess } = require("./device.service");
const { generateInviteCode } = require("../utils/tokens");
const ApiError = require("../utils/ApiError");

async function createInvite(deviceId, userId) {
  const { device, role } = await getDeviceAccess(deviceId, userId);
  if (role !== "owner") {
    throw new ApiError(403, "FORBIDDEN", "Only the device owner can create invite links");
  }

  const code = generateInviteCode();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  await Invite.create({
    deviceId: device._id,
    code,
    createdBy: userId,
    expiresAt,
  });

  return {
    code,
    expiresAt,
  };
}

async function acceptInvite(code, userId) {
  const invite = await Invite.findOne({
    code,
    usedBy: null,
    expiresAt: { $gt: new Date() },
  });

  if (!invite) {
    throw new ApiError(400, "INVALID_INVITE", "Invalid or expired invite code");
  }

  const device = await Device.findById(invite.deviceId);
  if (!device) {
    throw new ApiError(404, "DEVICE_NOT_FOUND", "Device no longer exists");
  }

  if (String(device.ownerId) === String(userId)) {
    throw new ApiError(400, "ALREADY_OWNER", "You are already the owner of this device");
  }

  const alreadyMember = device.members.some(
    (m) => String(m.userId) === String(userId)
  );

  if (!alreadyMember) {
    device.members.push({
      userId,
      role: "sender",
      addedAt: new Date(),
    });
    await device.save();
  }

  invite.usedBy = userId;
  invite.usedAt = new Date();
  await invite.save();

  const obj = device.toJSON();
  obj.userRole = "sender";
  return obj;
}

module.exports = {
  createInvite,
  acceptInvite,
};

