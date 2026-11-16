import React from "react";

const ICONS = [
  { name: "heart", emoji: "❤️", label: "Heart" },
  { name: "star", emoji: "⭐", label: "Star" },
  { name: "bone", emoji: "🦴", label: "Bone" },
  { name: "paw", emoji: "🐾", label: "Paw" },
  { name: "smile", emoji: "😊", label: "Smile" },
  { name: "sad", emoji: "😢", label: "Sad" },
  { name: "kiss", emoji: "😘", label: "Kiss" },
  { name: "sun", emoji: "☀️", label: "Sun" },
  { name: "moon", emoji: "🌙", label: "Moon" },
  { name: "coffee", emoji: "☕", label: "Coffee" },
  { name: "music", emoji: "🎵", label: "Music" },
  { name: "gift", emoji: "🎁", label: "Gift" },
  { name: "cake", emoji: "🎂", label: "Cake" },
  { name: "check", emoji: "✔️", label: "Check" },
  { name: "bell", emoji: "🔔", label: "Bell" },
  { name: "hug", emoji: "🤗", label: "Hug" },
];

export function IconPicker({ onSelectIcon }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        Built-in Pixel Icons (16x16)
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-8 gap-1.5">
        {ICONS.map((icon) => (
          <button
            key={icon.name}
            type="button"
            onClick={() => onSelectIcon(`:${icon.name}:`)}
            title={`:${icon.name}:`}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 hover:scale-105 active:scale-95 transition text-lg"
          >
            <span>{icon.emoji}</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono leading-none">
              {icon.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

