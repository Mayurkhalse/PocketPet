const Event = require("../models/Event");
const Command = require("../models/Command");
const ApiError = require("../utils/ApiError");

async function recordDeviceReaction(device, { reaction, refSeq }) {
  // Find command referenced by refSeq
  const command = await Command.findOne({
    deviceId: device._id,
    seq: refSeq,
  });

  if (!command) {
    throw new ApiError(404, "COMMAND_NOT_FOUND", "Referenced command not found for this device");
  }

  // Check 10-minute validity
  const ageMs = Date.now() - new Date(command.createdAt).getTime();
  if (ageMs > 10 * 60 * 1000) {
    throw new ApiError(400, "EXPIRED_REACTION_WINDOW", "Reaction window for this command has expired");
  }

  const toUserId = command.createdBy || device.ownerId;
  if (!toUserId) {
    throw new ApiError(400, "RECIPIENT_NOT_FOUND", "No user to receive this reaction");
  }

  const event = await Event.create({
    deviceId: device._id,
    type: "REACTION",
    reaction,
    refSeq,
    toUserId,
  });

  return event;
}

async function listUserEvents(deviceId, userId, { unreadOnly = false }) {
  const query = {
    deviceId,
    toUserId: userId,
  };

  if (unreadOnly) {
    query.readAt = null;
  }

  return Event.find(query).sort({ createdAt: -1 }).limit(50);
}

async function markEventsRead(userId, ids) {
  await Event.updateMany(
    {
      _id: { $in: ids },
      toUserId: userId,
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    }
  );
  return { message: "Events marked as read" };
}

module.exports = {
  recordDeviceReaction,
  listUserEvents,
  markEventsRead,
};

