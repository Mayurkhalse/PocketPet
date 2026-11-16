import { WIDTH, HEIGHT } from "./bitmapBuffer";

export function drawLine(buffer, x0, y0, x1, y1, val = 1) {
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    buffer.set(x0, y0, val);
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

export function drawRect(buffer, x0, y0, x1, y1, val = 1, filled = false) {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  if (filled) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        buffer.set(x, y, val);
      }
    }
  } else {
    for (let x = minX; x <= maxX; x++) {
      buffer.set(x, minY, val);
      buffer.set(x, maxY, val);
    }
    for (let y = minY; y <= maxY; y++) {
      buffer.set(minX, y, val);
      buffer.set(maxX, y, val);
    }
  }
}

export function drawCircle(buffer, xm, ym, r, val = 1, filled = false) {
  let x = -r, y = 0, err = 2 - 2 * r;
  do {
    if (filled) {
      for (let i = xm + x; i <= xm - x; i++) {
        buffer.set(i, ym + y, val);
        buffer.set(i, ym - y, val);
      }
    } else {
      buffer.set(xm - x, ym + y, val);
      buffer.set(xm - y, ym - x, val);
      buffer.set(xm + x, ym - y, val);
      buffer.set(xm + y, ym + x, val);
    }
    r = err;
    if (r <= y) err += ++y * 2 + 1;
    if (r > x || err > y) err += ++x * 2 + 1;
  } while (x < 0);
}

export function floodFill(buffer, startX, startY, newVal) {
  if (startX < 0 || startX >= WIDTH || startY < 0 || startY >= HEIGHT) return;
  const targetVal = buffer.get(startX, startY);
  if (targetVal === newVal) return;

  const stack = [[startX, startY]];
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) continue;
    if (buffer.get(x, y) !== targetVal) continue;

    buffer.set(x, y, newVal);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}

