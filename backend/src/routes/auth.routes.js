const express = require("express");
const authController = require("../controllers/auth.controller");
const authUser = require("../middleware/authUser");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { authLimiter } = require("../middleware/rateLimit");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.get("/me", authUser, asyncHandler(authController.getMe));

module.exports = router;

