import React, { useState, useRef } from "react";
import { IconPicker } from "./IconPicker";
import { Button } from "../ui/Button";
import { Send, Clock, Sparkles } from "lucide-react";

export function TextComposer({ onSend, isSending = false }) {
  const [text, setText] = useState("");
  const [durationSec, setDurationSec] = useState(30);
  const [showIcons, setShowIcons] = useState(false);
  const textareaRef = useRef(null);

  // Effective length: count :icon_name: as 1 char
  const effectiveLength = text.replace(/:([a-z0-9_]+):/g, "X").length;
  const isOverLimit = effectiveLength > 64;

  const handleInsertIcon = (iconToken) => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => prev + iconToken);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextText = text.substring(0, start) + iconToken + text.substring(end);
    setText(nextText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + iconToken.length, start + iconToken.length);
    }, 10);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isOverLimit || isSending) return;
    onSend({
      type: "text",
      text,
      durationSec,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-oled-card border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
        {/* OLED Screen Simulator Preview */}
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>OLED Preview (128x64 px)</span>
            <span className="text-[11px] font-mono text-sky-400">SSD1306 Display</span>
          </div>
          <div className="bg-black border-2 border-slate-700 rounded-lg p-3 min-h-[96px] flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-sky-500/80">PocketPet</div>
            <p className="text-center font-mono text-sky-300 text-sm sm:text-base leading-relaxed tracking-wide break-words max-w-full px-2">
              {text || <span className="text-slate-600 italic">Type a message below...</span>}
            </p>
          </div>
        </div>

        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">Message Content</label>
            <span
              className={`text-xs font-mono font-medium ${
                isOverLimit ? "text-rose-400 font-bold" : "text-slate-400"
              }`}
            >
              {effectiveLength}/64 chars
            </span>
          </div>

          <textarea
            ref={textareaRef}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here... Use :heart: for pixel icons"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-sky-500 font-mono resize-none"
          />
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowIcons(!showIcons)}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showIcons ? "Hide Icon Picker" : "Insert Built-in Icons"}
          </button>

          {/* Duration Slider */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-mono min-w-[32px]">{durationSec}s</span>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="w-24 accent-sky-400 cursor-pointer"
            />
          </div>
        </div>

        {showIcons && <IconPicker onSelectIcon={handleInsertIcon} />}

        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <Button
            type="submit"
            disabled={!text.trim() || isOverLimit || isSending}
            className="w-full sm:w-auto gap-2"
          >
            <Send className="w-4 h-4" />
            {isSending ? "Sending to Keychain..." : "Send to PocketPet"}
          </Button>
        </div>
      </div>
    </form>
  );
}

