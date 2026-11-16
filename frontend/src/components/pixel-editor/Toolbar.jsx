import React from "react";
import { useEditorStore } from "../../store/editorStore";
import {
  Pencil,
  Eraser,
  Minus,
  Square,
  Circle,
  PaintBucket,
  Undo2,
  Redo2,
  Trash2,
  Contrast,
  ZoomIn,
  ZoomOut,
  Upload,
} from "lucide-react";

export function Toolbar({ onOpenImport }) {
  const {
    tool,
    setTool,
    zoom,
    setZoom,
    undo,
    redo,
    undoStack,
    redoStack,
    clear,
    invert,
  } = useEditorStore();

  const tools = [
    { id: "pencil", icon: Pencil, label: "Pencil" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "fill", icon: PaintBucket, label: "Flood Fill" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-oled-card border border-slate-800 p-2.5 rounded-xl">
      {/* Drawing tools */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              className={`p-2 rounded-md transition ${
                isActive
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Canvas actions */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo"
          className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-md transition"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo"
          className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-md transition"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-800 mx-1" />
        <button
          onClick={invert}
          title="Invert Colors"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
        >
          <Contrast className="w-4 h-4" />
        </button>
        <button
          onClick={clear}
          title="Clear Canvas"
          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom & Import */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoom(Math.max(4, zoom - 2))}
            disabled={zoom <= 4}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">{zoom}x</span>
          <button
            onClick={() => setZoom(Math.min(10, zoom + 2))}
            disabled={zoom >= 10}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg transition"
        >
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          Import Image
        </button>
      </div>
    </div>
  );
}

