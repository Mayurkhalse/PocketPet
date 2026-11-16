import { BitmapBuffer, BUFFER_BYTES } from "./bitmapBuffer";

export function packToBase64(buffer) {
  let binaryString = "";
  for (let i = 0; i < buffer.data.length; i++) {
    binaryString += String.fromCharCode(buffer.data[i]);
  }
  return btoa(binaryString);
}

export function unpackFromBase64(base64String) {
  const binaryString = atob(base64String);
  const data = new Uint8Array(BUFFER_BYTES);
  for (let i = 0; i < Math.min(binaryString.length, BUFFER_BYTES); i++) {
    data[i] = binaryString.charCodeAt(i);
  }
  return new BitmapBuffer(data);
}

