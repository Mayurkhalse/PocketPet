const express = require("express");
const devicesController = require("../controllers/devices.controller");
const authUser = require("../middleware/authUser");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  claimDeviceSchema,
  updateDeviceSchema,
  sendContentSchema,
  sendPlaylistSchema,
  markEventsReadSchema,
} = require("../validators/device.validator");
const { claimLimiter, contentSendLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.use(authUser);

router.get("/", asyncHandler(devicesController.listDevices));
router.post("/claim", claimLimiter, validate(claimDeviceSchema), asyncHandler(devicesController.claimDevice));
router.get("/:id", asyncHandler(devicesController.getDevice));
router.patch("/:id", validate(updateDeviceSchema), asyncHandler(devicesController.updateDevice));
router.delete("/:id", asyncHandler(devicesController.unpairDevice));

// Members & Sharing
router.get("/:id/members", asyncHandler(devicesController.getMembers));
router.post("/:id/invites", asyncHandler(devicesController.createInvite));
router.delete("/:id/members/:userId", asyncHandler(devicesController.removeMember));

// Events / Reactions
router.get("/:id/events", asyncHandler(devicesController.getEvents));
router.post("/:id/events/read", validate(markEventsReadSchema), asyncHandler(devicesController.markEventsRead));

// Commands
router.post(
  "/:id/commands/content",
  contentSendLimiter,
  validate(sendContentSchema),
  asyncHandler(devicesController.sendContent)
);
router.post(
  "/:id/commands/playlist",
  contentSendLimiter,
  validate(sendPlaylistSchema),
  asyncHandler(devicesController.sendPlaylist)
);
router.post("/:id/commands/stop", asyncHandler(devicesController.sendStop));
router.get("/:id/commands", asyncHandler(devicesController.listCommands));
router.get("/:id/commands/:cmdId", asyncHandler(devicesController.getCommandStatus));

module.exports = router;

