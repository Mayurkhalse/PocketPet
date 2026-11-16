const playlistService = require("../services/playlist.service");

async function listPlaylists(req, res) {
  const playlists = await playlistService.listPlaylists(req.user._id);
  res.status(200).json(playlists);
}

async function getPlaylist(req, res) {
  const playlist = await playlistService.getPlaylist(req.params.id, req.user._id);
  res.status(200).json(playlist);
}

async function createPlaylist(req, res) {
  const playlist = await playlistService.createPlaylist(req.user._id, req.body);
  res.status(201).json(playlist);
}

async function updatePlaylist(req, res) {
  const playlist = await playlistService.updatePlaylist(
    req.params.id,
    req.user._id,
    req.body
  );
  res.status(200).json(playlist);
}

async function deletePlaylist(req, res) {
  const result = await playlistService.deletePlaylist(req.params.id, req.user._id);
  res.status(200).json(result);
}

module.exports = {
  listPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};

