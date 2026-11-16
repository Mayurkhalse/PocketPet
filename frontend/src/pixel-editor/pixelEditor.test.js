import { describe, it, expect } from "vitest";
import { BitmapBuffer, WIDTH, HEIGHT } from "./bitmapBuffer";
import { packToBase64, unpackFromBase64 } from "./pack";
import { drawLine, floodFill } from "./tools";

describe("Pixel Editor Logic", () => {
  it("initializes an empty 1024-byte bitmap", () => {
    const buf = new BitmapBuffer();
    expect(buf.data.length).toBe(1024);
    expect(buf.get(0, 0)).toBe(0);
    expect(buf.get(127, 63)).toBe(0);
  });

  it("sets and gets individual pixels correctly (LSB first)", () => {
    const buf = new BitmapBuffer();
    buf.set(0, 0, 1); // x=0, y=0 -> byte 0, bit 0 (value 1)
    expect(buf.data[0]).toBe(1);
    expect(buf.get(0, 0)).toBe(1);

    buf.set(7, 0, 1); // x=7, y=0 -> byte 0, bit 7 (value 128)
    expect(buf.data[0]).toBe(129);
    expect(buf.get(7, 0)).toBe(1);
  });

  it("packs to exactly 1368 base64 chars and unpacks faithfully", () => {
    const buf = new BitmapBuffer();
    buf.set(10, 20, 1);
    buf.set(100, 50, 1);

    const b64 = packToBase64(buf);
    expect(b64.length).toBe(1368);

    const unpacked = unpackFromBase64(b64);
    expect(unpacked.get(10, 20)).toBe(1);
    expect(unpacked.get(100, 50)).toBe(1);
    expect(unpacked.get(0, 0)).toBe(0);
  });

  it("draws lines using Bresenham algorithm", () => {
    const buf = new BitmapBuffer();
    drawLine(buf, 0, 0, 4, 4, 1);
    expect(buf.get(0, 0)).toBe(1);
    expect(buf.get(1, 1)).toBe(1);
    expect(buf.get(2, 2)).toBe(1);
    expect(buf.get(3, 3)).toBe(1);
    expect(buf.get(4, 4)).toBe(1);
  });

  it("performs flood fill inside boundaries", () => {
    const buf = new BitmapBuffer();
    // 3x3 box
    drawLine(buf, 0, 0, 2, 0, 1);
    drawLine(buf, 0, 2, 2, 2, 1);
    drawLine(buf, 0, 0, 0, 2, 1);
    drawLine(buf, 2, 0, 2, 2, 1);

    floodFill(buf, 1, 1, 1);
    expect(buf.get(1, 1)).toBe(1);
  });
});

