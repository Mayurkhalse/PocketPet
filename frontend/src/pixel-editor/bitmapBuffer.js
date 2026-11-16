export const WIDTH = 128;
export const HEIGHT = 64;
export const BUFFER_BYTES = 1024; // 128 * 64 / 8

export class BitmapBuffer {
  constructor(initialData = null) {
    this.data = initialData ? new Uint8Array(initialData) : new Uint8Array(BUFFER_BYTES);
  }

  get(x, y) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return 0;
    const byteIndex = y * 16 + (x >> 3);
    const bitMask = 1 << (x & 7);
    return (this.data[byteIndex] & bitMask) ? 1 : 0;
  }

  set(x, y, v) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
    const byteIndex = y * 16 + (x >> 3);
    const bitMask = 1 << (x & 7);
    if (v) {
      this.data[byteIndex] |= bitMask;
    } else {
      this.data[byteIndex] &= ~bitMask;
    }
  }

  clear() {
    this.data.fill(0);
  }

  invert() {
    for (let i = 0; i < BUFFER_BYTES; i++) {
      this.data[i] = ~this.data[i] & 0xff;
    }
  }

  clone() {
    return new BitmapBuffer(this.data);
  }
}

