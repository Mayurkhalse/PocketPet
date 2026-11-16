const Playlist = require("../models/Playlist");
const ApiError = require("../utils/ApiError");

async function listPlaylists(ownerId) {
  return Playlist.find({ ownerId }).sort({ createdAt: -1 });
}

async function getPlaylist(id, ownerId) {
  const playlist = await Playlist.findOne({ _id: id, ownerId });
  if (!playlist) {
    throw new ApiError(404, "PLAYLIST_NOT_FOUND", "Playlist not found");
  }
  return playlist;
}

async function createPlaylist(ownerId, data) {
  return Playlist.create({
    ownerId,
    name: data.name,
    repeat: !!data.repeat,
    items: data.items || [],
  });
}

async function updatePlaylist(id, ownerId, updates) {
  const playlist = await Playlist.findOne({ _id: id, ownerId });
  if (!playlist) {
    throw new ApiError(404, "PLAYLIST_NOT_FOUND", "Playlist not found");
  }

  if (updates.name !== undefined) playlist.name = updates.name;
  if (updates.repeat !== undefined) playlist.repeat = updates.repeat;
  if (updates.items !== undefined) playlist.items = updates.items;

  await playlist.save();
  return playlist;
}

async function deletePlaylist(id, ownerId) {
  const result = await Playlist.deleteOne({ _id: id, ownerId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "PLAYLIST_NOT_FOUND", "Playlist not found");
  }
  return { message: "Playlist deleted" };
}

module.exports = {
  listPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};

