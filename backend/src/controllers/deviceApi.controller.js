const pairingService = require("../services/pairing.service");
const commandService = require("../services/command.service");
const eventService = require("../services/event.service");

async function registerDevice(req, res) {
  const result = await pairingService.registerDevice(req.body);
  res.status(200).json(result);
}

async function getPairingCode(req, res) {
  const result = await pairingService.refreshPairingCode(req.device);
  res.status(200).json(result);
}

async function poll(req, res) {
  const result = await commandService.pollDevice(req.device, req.query);
  res.status(200).json(result);
}

async function ack(req, res) {
  await commandService.ackCommands(req.device, req.body.acks);
  res.status(204).send();
}

async function sendEvent(req, res) {
  await eventService.recordDeviceReaction(req.device, req.body);
  res.status(204).send();
}

module.exports = {
  registerDevice,
  getPairingCode,
  poll,
  ack,
  sendEvent,
};

