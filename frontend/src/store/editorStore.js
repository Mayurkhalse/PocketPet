import { create } from "zustand";
import { BitmapBuffer } from "../pixel-editor/bitmapBuffer";

const MAX_HISTORY = 50;

export const useEditorStore = create((set, get) => ({
  buffer: new BitmapBuffer(),
  tool: "pencil", // pencil, eraser, line, rect, circle, fill
  zoom: 6,
  undoStack: [],
  redoStack: [],

  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set({ zoom }),

  setBuffer: (newBuffer) => {
    set({
      buffer: newBuffer,
      undoStack: [],
      redoStack: [],
    });
  },

  commitChange: (newBuffer) => {
    const { buffer, undoStack } = get();
    const updatedUndo = [...undoStack, buffer.clone()];
    if (updatedUndo.length > MAX_HISTORY) updatedUndo.shift();

    set({
      buffer: newBuffer,
      undoStack: updatedUndo,
      redoStack: [],
    });
  },

  undo: () => {
    const { undoStack, redoStack, buffer } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    set({
      buffer: previous,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, buffer.clone()],
    });
  },

  redo: () => {
    const { undoStack, redoStack, buffer } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    set({
      buffer: next,
      undoStack: [...undoStack, buffer.clone()],
      redoStack: redoStack.slice(0, -1),
    });
  },

  clear: () => {
    const { buffer } = get();
    const newBuf = buffer.clone();
    newBuf.clear();
    get().commitChange(newBuf);
  },

  invert: () => {
    const { buffer } = get();
    const newBuf = buffer.clone();
    newBuf.invert();
    get().commitChange(newBuf);
  },
}));

