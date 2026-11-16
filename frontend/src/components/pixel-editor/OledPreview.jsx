import React, { useRef, useEffect } from "react";
import { WIDTH, HEIGHT } from "../../pixel-editor/bitmapBuffer";

export function OledPreview({ buffer, scale = 2 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH * scale, HEIGHT * scale);

    ctx.fillStyle = "#38bdf8"; // OLED blue glow
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (buffer.get(x, y) === 1) {
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }, [buffer, scale]);

  return (
    <div className="bg-black border-4 border-slate-800 rounded-lg p-2 shadow-2xl inline-block">
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center mb-1">
        Physical OLED 128x64 Preview
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH * scale}
        height={HEIGHT * scale}
        className="block rounded bg-black"
      />
    </div>
  );
}

