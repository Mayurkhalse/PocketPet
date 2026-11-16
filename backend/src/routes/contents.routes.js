const express = require("express");
const contentsController = require("../controllers/contents.controller");
const authUser = require("../middleware/authUser");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  createContentSchema,
  updateContentSchema,
} = require("../validators/content.validator");

const router = express.Router();

router.use(authUser);

router.get("/", asyncHandler(contentsController.listContents));
router.post("/", validate(createContentSchema), asyncHandler(contentsController.createContent));
router.get("/:id", asyncHandler(contentsController.getContent));
router.patch("/:id", validate(updateContentSchema), asyncHandler(contentsController.updateContent));
router.delete("/:id", asyncHandler(contentsController.deleteContent));

module.exports = router;

