# 🖼 1-Bit Bitmap Format Specification

## Canonical Format
- **Dimensions:** 128 (width) × 64 (height) pixels
- **Color depth:** 1 bit per pixel (monochrome: 0 = OFF / Black, 1 = ON / White or Blue)
- **Total size:** 1024 bytes (128 × 64 / 8)
- **Byte order:** Row-major, 16 bytes per row
- **Bit order:** **LSB (Least Significant Bit) = leftmost pixel** in each byte. This natively matches U8g2's `drawXBM` function.

### Pixel Coordinate to Byte Mapping
For any pixel coordinate `(x, y)` where `0 <= x < 128` and `0 <= y < 64`:
- **Byte index:** `y * 16 + (x >> 3)` (or `y * 16 + Math.floor(x / 8)`)
- **Bit index:** `x & 7` (or `x % 8`)
- **Bit mask:** `1 << (x & 7)`

### Transport Encoding
Bitmaps are transmitted over HTTP/JSON encoded as standard RFC 4648 Base64 strings.
- 1024 raw bytes encode to exactly **1368 Base64 characters** (with `=` padding).
- Both the backend and firmware validate that decoded payloads are exactly 1024 bytes.

