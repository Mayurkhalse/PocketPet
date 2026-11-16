const fs = require("fs");
const path = require("path");
const ApiError = require("../utils/ApiError");

let validIconNames = null;

function getValidIconNames() {
  if (!validIconNames) {
    try {
      const iconsPath = path.resolve(__dirname, "../../../shared/icons.json");
      const data = JSON.parse(fs.readFileSync(iconsPath, "utf-8"));
      validIconNames = new Set(data.map((icon) => icon.name));
    } catch {
      // Fallback in case path resolution varies
      validIconNames = new Set([
        "heart", "star", "bone", "paw", "smile", "sad", "kiss",
        "sun", "moon", "coffee", "music", "gift", "cake", "check", "bell", "hug"
      ]);
    }
  }
  return validIconNames;
}

/**
 * Validates text according to README §10.2:
 * - Max 64 characters counting each :icon: token as 1 character
 * - Printable ASCII (0x20–0x7E) plus \n (max 4 lines)
 * - Icon tokens must exist in shared/icons.json
 */
function validatePetText(text) {
  if (typeof text !== "string") {
    throw new ApiError(400, "INVALID_TEXT", "Text must be a string");
  }

  // Check lines
  const lines = text.split("\n");
  if (lines.length > 4) {
    throw new ApiError(400, "TOO_MANY_LINES", "Text cannot exceed 4 lines");
  }

  // Find all :icon_name: tokens
  const tokenRegex = /:([a-z0-9_]+):/g;
  const icons = getValidIconNames();

  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    const iconName = match[1];
    if (!icons.has(iconName)) {
      throw new ApiError(400, "UNKNOWN_ICON", `Unknown icon token :${iconName}:`);
    }
  }

  // Check printable ASCII + newline
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 10 || code === 13) continue; // \n or \r
    if (code < 0x20 || code > 0x7e) {
      throw new ApiError(400, "NON_ASCII_CHARACTER", "Only printable ASCII characters and valid icons are allowed");
    }
  }

  // Calculate length counting each :token: as 1 char
  const effectiveLength = text.replace(/:([a-z0-9_]+):/g, "X").length;
  if (effectiveLength > 64) {
    throw new ApiError(
      400,
      "TEXT_TOO_LONG",
      `Text length exceeds 64 characters (effective length: ${effectiveLength})`
    );
  }

  return true;
}

module.exports = {
  getValidIconNames,
  validatePetText,
};

