import React, { useState } from "react";
import {
  imageToGrayscaleMatrix,
  applyThreshold,
  applyFloydSteinberg,
} from "../../pixel-editor/dither";
import { OledPreview } from "./OledPreview";
import { Button } from "../ui/Button";
import { X, Image as ImageIcon, Sliders } from "lucide-react";

export function ImageImportModal({ isOpen, onClose, onApplyBuffer }) {
  const [imageMatrix, setImageMatrix] = useState(null);
  const [method, setMethod] = useState("dither"); // "dither" or "threshold"
  const [threshold, setThreshold] = useState(128);
  const [previewBuffer, setPreviewBuffer] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const mat = imageToGrayscaleMatrix(img);
      setImageMatrix(mat);
      updatePreview(mat, method, threshold);
    };
    img.src = URL.createObjectURL(file);
  };

  const updatePreview = (mat, meth, thresh) => {
    if (!mat) return;
    const buf = meth === "dither" ? applyFloydSteinberg(mat) : applyThreshold(mat, thresh);
    setPreviewBuffer(buf);
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    updatePreview(imageMatrix, newMethod, threshold);
  };

  const handleThresholdChange = (newThresh) => {
    setThreshold(newThresh);
    updatePreview(imageMatrix, method, newThresh);
  };

  const handleConfirm = () => {
    if (previewBuffer) {
      onApplyBuffer(previewBuffer);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-oled-card border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-sky-400" />
            Import & Convert Image
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-slate-950 hover:file:bg-sky-400 cursor-pointer"
        />

        {previewBuffer && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <OledPreview buffer={previewBuffer} scale={2} />
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleMethodChange("dither")}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  method === "dither" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Floyd–Steinberg Dithering
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange("threshold")}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  method === "threshold" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Luminance Threshold
              </button>
            </div>

            {method === "threshold" && (
              <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Threshold Value
                  </span>
                  <span className="font-mono text-sky-400">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="245"
                  value={threshold}
                  onChange={(e) => handleThresholdChange(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!previewBuffer}>
            Apply to Canvas
          </Button>
        </div>
      </div>
    </div>
  );
}

