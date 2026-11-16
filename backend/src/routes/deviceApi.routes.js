const express = require("express");
const deviceApiController = require("../controllers/deviceApi.controller");
const authDevice = require("../middleware/authDevice");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  registerDeviceApiSchema,
  pollQuerySchema,
  ackDeviceApiSchema,
  eventDeviceApiSchema,
} = require("../validators/deviceApi.validator");
const { registerDeviceLimiter, pollLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post(
  "/register",
  registerDeviceLimiter,
  validate(registerDeviceApiSchema),
  asyncHandler(deviceApiController.registerDevice)
);

router.post(
  "/pairing-code",
  authDevice,
  asyncHandler(deviceApiController.getPairingCode)
);

router.get(
  "/poll",
  authDevice,
  pollLimiter,
  validate(pollQuerySchema),
  asyncHandler(deviceApiController.poll)
);

router.post(
  "/ack",
  authDevice,
  validate(ackDeviceApiSchema),
  asyncHandler(deviceApiController.ack)
);

router.post(
  "/event",
  authDevice,
  validate(eventDeviceApiSchema),
  asyncHandler(deviceApiController.sendEvent)
);

module.exports = router;

