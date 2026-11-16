const ApiError = require("./ApiError");

const BITMAP_SIZE_BYTES = 1024; // 128x64 / 8

function validateBitmapB64(bitmapB64) {
  if (typeof bitmapB64 !== "string") {
    throw new ApiError(400, "INVALID_BITMAP", "Bitmap payload must be a string");
  }

  // Base64 format regex check
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Regex.test(bitmapB64)) {
    throw new ApiError(400, "INVALID_BITMAP_ENCODING", "Invalid base64 encoding");
  }

  const buffer = Buffer.from(bitmapB64, "base64");
  if (buffer.length !== BITMAP_SIZE_BYTES) {
    throw new ApiError(
      400,
      "INVALID_BITMAP_SIZE",
      `Decoded bitmap must be exactly ${BITMAP_SIZE_BYTES} bytes (128x64 1-bit), got ${buffer.length}`
    );
  }

  return buffer;
}

module.exports = {
  BITMAP_SIZE_BYTES,
  validateBitmapB64,
};

