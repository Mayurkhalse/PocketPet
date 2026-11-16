import React, { useState, useEffect } from "react";
import { deviceApi } from "../../services/deviceApi";
import { Check, CheckCheck, AlertCircle, Loader2 } from "lucide-react";

export function CommandStatusTicker({ deviceId, commandId, onDone }) {
  const [status, setStatus] = useState("pending");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!commandId || !deviceId) return;

    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 2 minutes

    const timer = setInterval(async () => {
      attempts++;
      try {
        const cmd = await deviceApi.getCommandStatus(deviceId, commandId);
        setStatus(cmd.status);
        if (cmd.error) setErrorMsg(cmd.error);

        if (cmd.status === "acked" || cmd.status === "failed" || cmd.status === "expired" || attempts >= maxAttempts) {
          clearInterval(timer);
          if (onDone) onDone(cmd.status);
        }
      } catch (err) {
        console.error("Error polling command status:", err);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [deviceId, commandId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-medium">
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <>
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
            <span className="text-slate-300">Sending to device queue...</span>
          </>
        )}
        {status === "delivered" && (
          <>
            <Check className="w-4 h-4 text-sky-400" />
            <span className="text-sky-400">Delivered to PocketPet, rendering...</span>
          </>
        )}
        {status === "acked" && (
          <>
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Displayed on OLED Screen!</span>
          </>
        )}
        {status === "failed" && (
          <>
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-rose-400">Execution failed: {errorMsg || "Device error"}</span>
          </>
        )}
        {status === "expired" && (
          <>
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400">Command expired (device offline)</span>
          </>
        )}
      </div>

      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
        Status: {status}
      </span>
    </div>
  );
}

