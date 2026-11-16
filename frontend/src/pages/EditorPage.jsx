import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { deviceApi } from "../services/deviceApi";
import { contentApi } from "../services/contentApi";
import { useEditorStore } from "../store/editorStore";
import { packToBase64 } from "../pixel-editor/pack";
import { PixelCanvas } from "../components/pixel-editor/PixelCanvas";
import { Toolbar } from "../components/pixel-editor/Toolbar";
import { OledPreview } from "../components/pixel-editor/OledPreview";
import { ImageImportModal } from "../components/pixel-editor/ImageImportModal";
import { CommandStatusTicker } from "../components/device/CommandStatusTicker";
import { Button } from "../components/ui/Button";
import { Send, BookmarkPlus, Sparkles, Check } from "lucide-react";

export function EditorPage() {
  const { buffer, commitChange } = useEditorStore();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [activeCommandId, setActiveCommandId] = useState(null);
  const [durationSec, setDurationSec] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [title, setTitle] = useState("My Drawing");

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: deviceApi.listDevices,
  });

  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0]._id);
    }
  }, [devices, selectedDeviceId]);

  const targetDeviceId = selectedDeviceId || devices[0]?._id;

  const handleSendToDevice = async () => {
    if (!targetDeviceId || isSending) return;
    setIsSending(true);

    try {
      const b64 = packToBase64(buffer);
      const res = await deviceApi.sendContent(targetDeviceId, {
        type: "bitmap",
        bitmapB64: b64,
        durationSec,
      });
      setActiveCommandId(res.commandId);
    } catch (err) {
      alert(err.response?.data?.error?.message || "Failed to send drawing to device");
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveToLibrary = async () => {
    try {
      const b64 = packToBase64(buffer);
      await contentApi.createContent({
        type: "bitmap",
        title: title || "Untitled Drawing",
        bitmapB64: b64,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      alert("Failed to save drawing to library");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sky-400" />
            128×64 Pixel Art Studio
          </h1>
          <p className="text-xs text-slate-400">
            Draw monochrome pixel artwork natively rendered on your PocketPet SSD1306 display
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSaveToLibrary}
            className="gap-1.5 text-xs"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5 text-sky-400" />}
            {isSaved ? "Saved to Library" : "Save to Library"}
          </Button>
        </div>
      </div>

      <Toolbar onOpenImport={() => setIsImportOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Canvas Editor */}
        <div className="lg:col-span-3 space-y-4">
          <PixelCanvas />

          {activeCommandId && selectedDeviceId && (
            <CommandStatusTicker deviceId={selectedDeviceId} commandId={activeCommandId} />
          )}
        </div>

        {/* Sidebar Controls & Preview */}
        <div className="space-y-6">
          <div className="bg-oled-card border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4 flex flex-col items-center">
            <OledPreview buffer={buffer} scale={2} />
          </div>

          <div className="bg-oled-card border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Send className="w-4 h-4 text-sky-400" /> Dispatch to Keychain
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Device</label>
              {devices.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No devices paired</p>
              ) : (
                <select
                  value={targetDeviceId || ""}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {devices.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.online ? "Online" : "Offline"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Display Duration</span>
                <span className="font-mono text-sky-400">{durationSec}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <Button
              onClick={handleSendToDevice}
              disabled={!targetDeviceId || isSending}
              className="w-full gap-2 text-xs py-2.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? "Sending to Pet..." : "Broadcast Drawing"}
            </Button>
          </div>
        </div>
      </div>

      <ImageImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onApplyBuffer={(newBuffer) => commitChange(newBuffer)}
      />
    </div>
  );
}

