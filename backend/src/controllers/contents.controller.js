const contentService = require("../services/content.service");

async function listContents(req, res) {
  const contents = await contentService.listContents(req.user._id);
  res.status(200).json(contents);
}

async function getContent(req, res) {
  const content = await contentService.getContent(req.params.id, req.user._id);
  res.status(200).json(content);
}

async function createContent(req, res) {
  const content = await contentService.createContent(req.user._id, req.body);
  res.status(201).json(content);
}

async function updateContent(req, res) {
  const content = await contentService.updateContent(
    req.params.id,
    req.user._id,
    req.body
  );
  res.status(200).json(content);
}

async function deleteContent(req, res) {
  const result = await contentService.deleteContent(req.params.id, req.user._id);
  res.status(200).json(result);
}

module.exports = {
  listContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
};

