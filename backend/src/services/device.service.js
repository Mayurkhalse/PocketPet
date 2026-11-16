const Device = require("../models/Device");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const commandService = require("./command.service");

async function getDeviceAccess(deviceId, userId) {
  const device = await Device.findById(deviceId);
  if (!device) throw new ApiError(404, "DEVICE_NOT_FOUND", "Device not found");
  
  if (device.ownerId && String(device.ownerId) === String(userId)) {
    return { device, role: "owner" };
  }
  
  const isMember = device.members.some((m) => String(m.userId) === String(userId));
  if (isMember) {
    return { device, role: "sender" };
  }
  
  // 404 to avoid leaking existence to unauthorized users
  throw new ApiError(404, "DEVICE_NOT_FOUND", "Device not found");
}

async function listUserDevices(userId) {
  const devices = await Device.find({
    $or: [{ ownerId: userId }, { "members.userId": userId }],
  }).sort({ createdAt: -1 });

  return devices.map((d) => {
    const isOwner = String(d.ownerId) === String(userId);
    const obj = d.toJSON();
    obj.userRole = isOwner ? "owner" : "sender";
    return obj;
  });
}

async function getDeviceDetail(deviceId, userId) {
  const { device, role } = await getDeviceAccess(deviceId, userId);
  const obj = device.toJSON();
  obj.userRole = role;
  return obj;
}

async function updateDevice(deviceId, userId, { name, settings }) {
  const { device, role } = await getDeviceAccess(deviceId, userId);
  if (role !== "owner") {
    throw new ApiError(403, "FORBIDDEN", "Only the device owner can update settings");
  }

  if (name !== undefined) {
    device.name = name;
  }

  if (settings) {
    let settingsChanged = false;
    for (const [key, val] of Object.entries(settings)) {
      if (val !== undefined && device.settings[key] !== val) {
        device.settings[key] = val;
        settingsChanged = true;
      }
    }

    if (settingsChanged) {
      await commandService.enqueueCommand({
        deviceId: device._id,
        userId,
        type: "SET_SETTINGS",
        payload: {
          brightness: device.settings.brightness,
          pollIntervalSec: device.settings.pollIntervalSec,
        },
      });
    }
  }

  await device.save();
  return device;
}

async function unpairDevice(deviceId, userId) {
  const { device, role } = await getDeviceAccess(deviceId, userId);
  if (role !== "owner") {
    throw new ApiError(403, "FORBIDDEN", "Only the device owner can unpair the device");
  }

  // Enqueue UNPAIR command
  await commandService.enqueueCommand({
    deviceId: device._id,
    userId,
    type: "UNPAIR",
    payload: {},
  });

  // Clear owner and members
  device.ownerId = null;
  device.members = [];
  device.claimedAt = null;
  await device.save();

  return { message: "Device unpaired successfully" };
}

async function getDeviceMembers(deviceId, userId) {
  const { device, role } = await getDeviceAccess(deviceId, userId);
  const owner = device.ownerId
    ? await User.findById(device.ownerId).select("displayName email")
    : null;

  const memberUserIds = device.members.map((m) => m.userId);
  const memberUsers = await User.find({ _id: { $in: memberUserIds } }).select("displayName email");
  const memberUserMap = new Map(memberUsers.map((u) => [u._id.toString(), u]));

  const members = device.members.map((m) => {
    const u = memberUserMap.get(m.userId.toString());
    return {
      userId: m.userId,
      displayName: u?.displayName || "Unknown",
      email: u?.email || "",
      role: m.role,
      addedAt: m.addedAt,
    };
  });

  return {
    owner: owner ? { userId: owner._id, displayName: owner.displayName, email: owner.email } : null,
    members,
    currentUserRole: role,
  };
}

async function removeMember(deviceId, userId, targetUserId) {
  const { device, role } = await getDeviceAccess(deviceId, userId);
  const isSelf = String(userId) === String(targetUserId);

  if (role !== "owner" && !isSelf) {
    throw new ApiError(403, "FORBIDDEN", "You cannot remove another member");
  }

  device.members = device.members.filter((m) => String(m.userId) !== String(targetUserId));
  await device.save();
  return { message: "Member removed" };
}

module.exports = {
  getDeviceAccess,
  listUserDevices,
  getDeviceDetail,
  updateDevice,
  unpairDevice,
  getDeviceMembers,
  removeMember,
};

