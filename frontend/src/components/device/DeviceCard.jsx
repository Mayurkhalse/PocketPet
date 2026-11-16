import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { Button } from "../ui/Button";
import { Send, Settings, Users, Sparkles } from "lucide-react";

export function DeviceCard({ device }) {
  return (
    <div className="bg-oled-card border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
              {device.name}
              {device.userRole === "owner" ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Owner
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Sender
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{device.hardwareId}</p>
          </div>
          <span className="text-3xl">🐶</span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <StatusBadge
            online={device.online}
            lastSeenAt={device.status?.lastSeenAt}
            battery={device.status?.battery}
            rssi={device.status?.rssi}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 pt-2">
        <Link to={`/devices/${device._id}/compose`} className="flex-1">
          <Button size="sm" className="w-full gap-1.5">
            <Send className="w-3.5 h-3.5" /> Send
          </Button>
        </Link>
        <Link to={`/devices/${device._id}`}>
          <Button size="sm" variant="secondary" title="View details & settings">
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

