import React from "react";
import { Wifi, Battery, BatteryCharging } from "lucide-react";

export function StatusBadge({ online, lastSeenAt, battery, rssi }) {
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never";
    const sec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    return `${Math.floor(sec / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-2.5 text-xs">
      <div className="flex items-center gap-1.5 font-medium">
        <span
          className={`w-2 h-2 rounded-full ${
            online ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-600"
          }`}
        />
        <span className={online ? "text-emerald-400" : "text-slate-400"}>
          {online ? "Online" : "Offline"}
        </span>
      </div>

      <span className="text-slate-600">•</span>
      <span className="text-slate-400">{formatLastSeen(lastSeenAt)}</span>

      {battery !== null && battery !== undefined && (
        <span className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
          <Battery className="w-3.5 h-3.5 text-slate-300" />
          {battery}%
        </span>
      )}

      {rssi !== null && rssi !== undefined && (
        <span className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded" title={`RSSI: ${rssi} dBm`}>
          <Wifi className="w-3 h-3 text-slate-300" />
        </span>
      )}
    </div>
  );
}

