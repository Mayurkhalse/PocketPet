const express = require("express");
const authRoutes = require("./auth.routes");
const devicesRoutes = require("./devices.routes");
const contentsRoutes = require("./contents.routes");
const playlistsRoutes = require("./playlists.routes");
const deviceApiRoutes = require("./deviceApi.routes");
const authUser = require("../middleware/authUser");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const devicesController = require("../controllers/devices.controller");
const { acceptInviteSchema } = require("../validators/device.validator");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/devices", devicesRoutes);
router.use("/contents", contentsRoutes);
router.use("/playlists", playlistsRoutes);
router.use("/device", deviceApiRoutes);

// Shortcut invite accept route: POST /api/v1/invites/accept
router.post(
  "/invites/accept",
  authUser,
  validate(acceptInviteSchema),
  asyncHandler(devicesController.acceptInvite)
);

module.exports = router;

