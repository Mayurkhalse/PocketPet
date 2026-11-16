const express = require("express");
const playlistsController = require("../controllers/playlists.controller");
const authUser = require("../middleware/authUser");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  createPlaylistSchema,
  updatePlaylistSchema,
} = require("../validators/playlist.validator");

const router = express.Router();

router.use(authUser);

router.get("/", asyncHandler(playlistsController.listPlaylists));
router.post("/", validate(createPlaylistSchema), asyncHandler(playlistsController.createPlaylist));
router.get("/:id", asyncHandler(playlistsController.getPlaylist));
router.put("/:id", validate(updatePlaylistSchema), asyncHandler(playlistsController.updatePlaylist));
router.delete("/:id", asyncHandler(playlistsController.deletePlaylist));

module.exports = router;

