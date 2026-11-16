import React, { useRef, useEffect, useState } from "react";
import { WIDTH, HEIGHT } from "../../pixel-editor/bitmapBuffer";
import { drawLine, drawRect, drawCircle, floodFill } from "../../pixel-editor/tools";
import { useEditorStore } from "../../store/editorStore";

export function PixelCanvas() {
  const { buffer, tool, zoom, commitChange } = useEditorStore();
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [previewBuffer, setPreviewBuffer] = useState(null);

  const activeBuffer = previewBuffer || buffer;

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#05070a"; // background
    ctx.fillRect(0, 0, WIDTH * zoom, HEIGHT * zoom);

    // Draw active pixels
    ctx.fillStyle = "#38bdf8"; // OLED blue pixel
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (activeBuffer.get(x, y) === 1) {
          ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
        }
      }
    }

    // Grid lines if zoom >= 6
    if (zoom >= 6) {
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom, 0);
        ctx.lineTo(x * zoom, HEIGHT * zoom);
        ctx.stroke();
      }
      for (let y = 0; y <= HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom);
        ctx.lineTo(WIDTH * zoom, y * zoom);
        ctx.stroke();
      }
    }
  }, [activeBuffer, zoom]);

  const getLogicalCoord = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = Math.floor((clientX - rect.left) / zoom);
    const y = Math.floor((clientY - rect.top) / zoom);
    return {
      x: Math.max(0, Math.min(WIDTH - 1, x)),
      y: Math.max(0, Math.min(HEIGHT - 1, y)),
    };
  };

  const handlePointerDown = (e) => {
    setIsDrawing(true);
    const { x, y } = getLogicalCoord(e);
    setStartPos({ x, y });

    if (tool === "pencil") {
      const draft = buffer.clone();
      draft.set(x, y, 1);
      setPreviewBuffer(draft);
    } else if (tool === "eraser") {
      const draft = buffer.clone();
      draft.set(x, y, 0);
      setPreviewBuffer(draft);
    } else if (tool === "fill") {
      const draft = buffer.clone();
      floodFill(draft, x, y, 1);
      commitChange(draft);
      setIsDrawing(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !startPos) return;
    const { x, y } = getLogicalCoord(e);

    if (tool === "pencil") {
      const draft = (previewBuffer || buffer).clone();
      drawLine(draft, startPos.x, startPos.y, x, y, 1);
      setStartPos({ x, y });
      setPreviewBuffer(draft);
    } else if (tool === "eraser") {
      const draft = (previewBuffer || buffer).clone();
      drawLine(draft, startPos.x, startPos.y, x, y, 0);
      setStartPos({ x, y });
      setPreviewBuffer(draft);
    } else if (tool === "line") {
      const draft = buffer.clone();
      drawLine(draft, startPos.x, startPos.y, x, y, 1);
      setPreviewBuffer(draft);
    } else if (tool === "rect") {
      const draft = buffer.clone();
      drawRect(draft, startPos.x, startPos.y, x, y, 1, false);
      setPreviewBuffer(draft);
    } else if (tool === "circle") {
      const draft = buffer.clone();
      const r = Math.round(Math.hypot(x - startPos.x, y - startPos.y));
      drawCircle(draft, startPos.x, startPos.y, r, 1, false);
      setPreviewBuffer(draft);
    }
  };

  const handlePointerUp = () => {
    if (previewBuffer) {
      commitChange(previewBuffer);
      setPreviewBuffer(null);
    }
    setIsDrawing(false);
    setStartPos(null);
  };

  return (
    <div className="overflow-auto max-w-full bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={WIDTH * zoom}
        height={HEIGHT * zoom}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="cursor-crosshair shadow-2xl rounded"
      />
    </div>
  );
}

