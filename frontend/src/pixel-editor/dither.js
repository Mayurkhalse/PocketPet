import { BitmapBuffer, WIDTH, HEIGHT } from "./bitmapBuffer";

export function imageToGrayscaleMatrix(imageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  // Draw scaled
  ctx.drawImage(imageElement, 0, 0, WIDTH, HEIGHT);
  const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const pixels = imgData.data;

  const matrix = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = new Float32Array(WIDTH);
    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 4;
      // Standard Rec. 601 luma
      const gray = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
      row[x] = gray;
    }
    matrix.push(row);
  }
  return matrix;
}

export function applyThreshold(grayMatrix, threshold = 128) {
  const buffer = new BitmapBuffer();
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      buffer.set(x, y, grayMatrix[y][x] >= threshold ? 1 : 0);
    }
  }
  return buffer;
}

export function applyFloydSteinberg(grayMatrix) {
  const buffer = new BitmapBuffer();
  // Deep copy matrix to mutate with errors
  const mat = grayMatrix.map((row) => new Float32Array(row));

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const oldPixel = mat[y][x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      buffer.set(x, y, newPixel === 255 ? 1 : 0);
      const quantError = oldPixel - newPixel;

      if (x + 1 < WIDTH) mat[y][x + 1] += quantError * (7 / 16);
      if (x - 1 >= 0 && y + 1 < HEIGHT) mat[y + 1][x - 1] += quantError * (3 / 16);
      if (y + 1 < HEIGHT) mat[y + 1][x] += quantError * (5 / 16);
      if (x + 1 < WIDTH && y + 1 < HEIGHT) mat[y + 1][x + 1] += quantError * (1 / 16);
    }
  }

  return buffer;
}

