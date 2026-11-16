import { describe, it, expect } from "vitest";
const { validateBitmapB64, BITMAP_SIZE_BYTES } = require("../../src/utils/bitmap");

describe("Bitmap Utility", () => {
  it("accepts valid 1024-byte base64 encoded bitmaps", () => {
    const rawBuffer = Buffer.alloc(BITMAP_SIZE_BYTES, 0xaa);
    const b64 = rawBuffer.toString("base64");
    expect(b64).toHaveLength(1368);

    const decoded = validateBitmapB64(b64);
    expect(decoded.length).toBe(1024);
  });

  it("rejects non-string payloads", () => {
    expect(() => validateBitmapB64(123)).toThrow();
  });

  it("rejects wrong buffer lengths", () => {
    const wrongBuffer = Buffer.alloc(512, 0);
    const b64 = wrongBuffer.toString("base64");
    expect(() => validateBitmapB64(b64)).toThrow("Decoded bitmap must be exactly 1024 bytes");
  });
});

