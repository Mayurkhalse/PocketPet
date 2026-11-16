import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { deviceApi } from "../services/deviceApi";
import { TextComposer } from "../components/compose/TextComposer";
import { CommandStatusTicker } from "../components/device/CommandStatusTicker";
import { ArrowLeft, Sparkles } from "lucide-react";

export function ComposePage() {
  const { id } = useParams();
  const [activeCommandId, setActiveCommandId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (contentPayload) => {
    setError("");
    setIsSending(true);

    try {
      const res = await deviceApi.sendContent(id, contentPayload);
      setActiveCommandId(res.commandId);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to deliver content to pet");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        to={`/devices/${id}`}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Device
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-sky-400" />
          Send Message to Pet
        </h1>
        <p className="text-xs text-slate-400">
          Craft pixel messages with inline icons to show on your keychain screen
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {activeCommandId && (
        <CommandStatusTicker
          deviceId={id}
          commandId={activeCommandId}
          onDone={() => {
            // Optional callback
          }}
        />
      )}

      <TextComposer onSend={handleSend} isSending={isSending} />
    </div>
  );
}

