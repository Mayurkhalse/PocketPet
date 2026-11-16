const Command = require("../models/Command");
const Device = require("../models/Device");
const PairingCode = require("../models/PairingCode");
const { generatePairingCode } = require("../utils/tokens");
const ApiError = require("../utils/ApiError");
const { env } = require("../config/env");

async function enqueueCommand({ deviceId, userId, type, payload, expiresInSec }) {
  const device = await Device.findByIdAndUpdate(
    deviceId,
    { $inc: { nextSeq: 1 } },
    { new: true }
  );

  if (!device) {
    throw new ApiError(404, "DEVICE_NOT_FOUND", "Device not found");
  }

  const seq = device.nextSeq - 1;
  const ttlSec = expiresInSec || env.COMMAND_TTL_MIN * 60;
  const expiresAt = new Date(Date.now() + ttlSec * 1000);

  const command = await Command.create({
    deviceId,
    seq,
    type,
    payload,
    createdBy: userId,
    status: "pending",
    expiresAt,
  });

  return command;
}

async function pollDevice(device, query = {}) {
  const now = new Date();

  // 1. Update device status telemetry
  const updateFields = { "status.lastSeenAt": now };
  if (query.fw) updateFields["status.fwVersion"] = query.fw;
  if (query.rssi !== undefined) updateFields["status.rssi"] = Number(query.rssi);
  if (query.bat !== undefined) updateFields["status.battery"] = Number(query.bat);
  if (query.mode) updateFields["status.currentMode"] = query.mode;

  const lastSeq = query.lastSeq ? Number(query.lastSeq) : 0;
  if (lastSeq > (device.status?.lastAckedSeq || 0)) {
    updateFields["status.lastAckedSeq"] = lastSeq;
  }

  await Device.findByIdAndUpdate(device._id, { $set: updateFields });

  // 2. If unclaimed, return paired: false and valid pairing code
  if (!device.ownerId) {
    let pairing = await PairingCode.findOne({
      deviceId: device._id,
      expiresAt: { $gt: now },
    });

    if (!pairing) {
      await PairingCode.deleteMany({ deviceId: device._id });
      const code = generatePairingCode();
      const expiresAt = new Date(Date.now() + env.PAIRING_CODE_TTL_MIN * 60 * 1000);
      pairing = await PairingCode.create({
        deviceId: device._id,
        code,
        expiresAt,
        attempts: 0,
      });
    }

    return {
      paired: false,
      pairingCode: pairing.code,
      pollIntervalSec: device.settings?.pollIntervalSec || env.DEVICE_POLL_DEFAULT_SEC,
      commands: [],
      serverTime: now.toISOString(),
    };
  }

  // 3. Mark commands <= lastSeq as acked (if delivered or pending)
  if (lastSeq > 0) {
    await Command.updateMany(
      {
        deviceId: device._id,
        seq: { $lte: lastSeq },
        status: { $in: ["pending", "delivered"] },
      },
      {
        $set: {
          status: "acked",
          ackedAt: now,
        },
      }
    );
  }

  // 4. Expire stale commands
  await Command.updateMany(
    {
      deviceId: device._id,
      status: { $in: ["pending", "delivered"] },
      expiresAt: { $lt: now },
    },
    {
      $set: { status: "expired" },
    }
  );

  // 5. Find next pending/delivered commands
  const commands = await Command.find({
    deviceId: device._id,
    seq: { $gt: lastSeq },
    status: { $in: ["pending", "delivered"] },
  })
    .sort({ seq: 1 })
    .limit(5);

  // 6. Mark fetched commands as delivered
  const returnedCommands = [];
  for (const cmd of commands) {
    cmd.status = "delivered";
    cmd.deliveredAt = now;
    cmd.attempts += 1;
    await cmd.save();

    returnedCommands.push({
      seq: cmd.seq,
      type: cmd.type,
      payload: cmd.payload,
      expiresAt: cmd.expiresAt?.toISOString() || null,
    });
  }

  return {
    paired: true,
    pollIntervalSec: device.settings?.pollIntervalSec || env.DEVICE_POLL_DEFAULT_SEC,
    commands: returnedCommands,
    serverTime: now.toISOString(),
  };
}

async function ackCommands(device, acks) {
  const now = new Date();
  let maxAckedSeq = device.status?.lastAckedSeq || 0;

  for (const ack of acks) {
    const status = ack.status === "ok" ? "acked" : "failed";
    await Command.findOneAndUpdate(
      { deviceId: device._id, seq: ack.seq },
      {
        $set: {
          status,
          ackedAt: now,
          error: ack.error || null,
        },
      }
    );
    if (ack.seq > maxAckedSeq) {
      maxAckedSeq = ack.seq;
    }
  }

  await Device.findByIdAndUpdate(device._id, {
    $set: { "status.lastAckedSeq": maxAckedSeq },
  });
}

async function listCommands(deviceId, userId, userRole, { limit = 20, cursor }) {
  const query = { deviceId };
  if (userRole !== "owner") {
    query.createdBy = userId;
  }
  if (cursor) {
    query._id = { $lt: cursor };
  }

  const commands = await Command.find(query)
    .sort({ _id: -1 })
    .limit(Number(limit) + 1)
    .populate("createdBy", "displayName email");

  const hasMore = commands.length > limit;
  const items = hasMore ? commands.slice(0, limit) : commands;
  const nextCursor = hasMore ? items[items.length - 1]._id : null;

  return {
    items,
    nextCursor,
  };
}

async function getCommandStatus(deviceId, userId, userRole, cmdId) {
  const command = await Command.findOne({ _id: cmdId, deviceId }).populate(
    "createdBy",
    "displayName email"
  );
  if (!command) {
    throw new ApiError(404, "COMMAND_NOT_FOUND", "Command not found");
  }

  if (userRole !== "owner" && String(command.createdBy?._id) !== String(userId)) {
    throw new ApiError(404, "COMMAND_NOT_FOUND", "Command not found");
  }

  return command;
}

module.exports = {
  enqueueCommand,
  pollDevice,
  ackCommands,
  listCommands,
  getCommandStatus,
};

