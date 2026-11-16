const deviceService = require("../services/device.service");
const pairingService = require("../services/pairing.service");
const commandService = require("../services/command.service");
const sharingService = require("../services/sharing.service");
const eventService = require("../services/event.service");
const playlistService = require("../services/playlist.service");
const ApiError = require("../utils/ApiError");

async function listDevices(req, res) {
  const devices = await deviceService.listUserDevices(req.user._id);
  res.status(200).json(devices);
}

async function claimDevice(req, res) {
  const { code, name } = req.body;
  const device = await pairingService.claimDevice({
    code,
    name,
    userId: req.user._id,
  });
  res.status(200).json(device);
}

async function getDevice(req, res) {
  const device = await deviceService.getDeviceDetail(req.params.id, req.user._id);
  res.status(200).json(device);
}

async function updateDevice(req, res) {
  const device = await deviceService.updateDevice(req.params.id, req.user._id, req.body);
  res.status(200).json(device);
}

async function unpairDevice(req, res) {
  const result = await deviceService.unpairDevice(req.params.id, req.user._id);
  res.status(200).json(result);
}

async function getMembers(req, res) {
  const result = await deviceService.getDeviceMembers(req.params.id, req.user._id);
  res.status(200).json(result);
}

async function createInvite(req, res) {
  const invite = await sharingService.createInvite(req.params.id, req.user._id);
  res.status(201).json(invite);
}

async function acceptInvite(req, res) {
  const device = await sharingService.acceptInvite(req.body.code, req.user._id);
  res.status(200).json(device);
}

async function removeMember(req, res) {
  const result = await deviceService.removeMember(
    req.params.id,
    req.user._id,
    req.params.userId
  );
  res.status(200).json(result);
}

async function sendContent(req, res) {
  const { device, role } = await deviceService.getDeviceAccess(req.params.id, req.user._id);
  const { type, text, bitmapB64, durationSec, expiresInSec } = req.body;

  const payload = {
    kind: type,
    durationSec: durationSec || 30,
    fromName: req.user.displayName.slice(0, 10),
    isOwner: role === "owner",
  };

  if (type === "text") {
    payload.text = text;
  } else if (type === "bitmap") {
    payload.bitmapB64 = bitmapB64;
  }

  const command = await commandService.enqueueCommand({
    deviceId: device._id,
    userId: req.user._id,
    type: "SHOW_CONTENT",
    payload,
    expiresInSec,
  });

  res.status(201).json({
    commandId: command._id,
    seq: command.seq,
    status: command.status,
  });
}

async function sendPlaylist(req, res) {
  const { device } = await deviceService.getDeviceAccess(req.params.id, req.user._id);
  const { playlistId, items, repeat } = req.body;

  let playlistPayload = {};

  if (playlistId) {
    const playlist = await playlistService.getPlaylist(playlistId, req.user._id);
    playlistPayload = {
      playlistId: playlist._id.toString(),
      name: playlist.name,
      repeat: playlist.repeat,
      items: playlist.items.map((it) => ({
        kind: it.type,
        text: it.text || undefined,
        bitmapB64: it.bitmapB64 || undefined,
        durationSec: it.durationSec,
      })),
    };
  } else {
    playlistPayload = {
      repeat: !!repeat,
      items: items.map((it) => ({
        kind: it.type,
        text: it.text || undefined,
        bitmapB64: it.bitmapB64 || undefined,
        durationSec: it.durationSec,
      })),
    };
  }

  const command = await commandService.enqueueCommand({
    deviceId: device._id,
    userId: req.user._id,
    type: "PLAY_PLAYLIST",
    payload: playlistPayload,
  });

  res.status(201).json({
    commandId: command._id,
    seq: command.seq,
    status: command.status,
  });
}

async function sendStop(req, res) {
  const { device } = await deviceService.getDeviceAccess(req.params.id, req.user._id);

  const command = await commandService.enqueueCommand({
    deviceId: device._id,
    userId: req.user._id,
    type: "STOP",
    payload: {},
  });

  res.status(201).json({
    commandId: command._id,
    seq: command.seq,
    status: command.status,
  });
}

async function listCommands(req, res) {
  const { role } = await deviceService.getDeviceAccess(req.params.id, req.user._id);
  const result = await commandService.listCommands(
    req.params.id,
    req.user._id,
    role,
    req.query
  );
  res.status(200).json(result);
}

async function getCommandStatus(req, res) {
  const { role } = await deviceService.getDeviceAccess(req.params.id, req.user._id);
  const command = await commandService.getCommandStatus(
    req.params.id,
    req.user._id,
    role,
    req.params.cmdId
  );
  res.status(200).json(command);
}

async function getEvents(req, res) {
  await deviceService.getDeviceAccess(req.params.id, req.user._id);
  const unreadOnly = req.query.unread === "true";
  const events = await eventService.listUserEvents(req.params.id, req.user._id, {
    unreadOnly,
  });
  res.status(200).json(events);
}

async function markEventsRead(req, res) {
  await deviceService.getDeviceAccess(req.params.id, req.user._id);
  const result = await eventService.markEventsRead(req.user._id, req.body.ids);
  res.status(200).json(result);
}

module.exports = {
  listDevices,
  claimDevice,
  getDevice,
  updateDevice,
  unpairDevice,
  getMembers,
  createInvite,
  acceptInvite,
  removeMember,
  sendContent,
  sendPlaylist,
  sendStop,
  listCommands,
  getCommandStatus,
  getEvents,
  markEventsRead,
};

