const Content = require("../models/Content");
const ApiError = require("../utils/ApiError");

async function listContents(ownerId) {
  return Content.find({ ownerId }).sort({ createdAt: -1 });
}

async function getContent(id, ownerId) {
  const content = await Content.findOne({ _id: id, ownerId });
  if (!content) {
    throw new ApiError(404, "CONTENT_NOT_FOUND", "Content not found");
  }
  return content;
}

async function createContent(ownerId, data) {
  return Content.create({
    ownerId,
    type: data.type,
    title: data.title,
    text: data.text || null,
    bitmapB64: data.bitmapB64 || null,
  });
}

async function updateContent(id, ownerId, updates) {
  const content = await Content.findOne({ _id: id, ownerId });
  if (!content) {
    throw new ApiError(404, "CONTENT_NOT_FOUND", "Content not found");
  }

  if (updates.title !== undefined) content.title = updates.title;
  if (updates.text !== undefined) content.text = updates.text;
  if (updates.bitmapB64 !== undefined) content.bitmapB64 = updates.bitmapB64;

  await content.save();
  return content;
}

async function deleteContent(id, ownerId) {
  const result = await Content.deleteOne({ _id: id, ownerId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "CONTENT_NOT_FOUND", "Content not found");
  }
  return { message: "Content deleted" };
}

module.exports = {
  listContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
};

