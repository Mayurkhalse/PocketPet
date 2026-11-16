import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceApi } from "../../services/deviceApi";
import { Heart, Smile, Check } from "lucide-react";

export function ReactionFeed({ deviceId }) {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["device-events", deviceId],
    queryFn: () => deviceApi.getEvents(deviceId, false),
    refetchInterval: 8000,
  });

  const markReadMutation = useMutation({
    mutationFn: (ids) => deviceApi.markEventsRead(deviceId, ids),
    onSuccess: () => {
      queryClient.invalidateQueries(["device-events", deviceId]);
    },
  });

  const unreadEvents = events.filter((e) => !e.readAt);

  const handleMarkAllRead = () => {
    if (unreadEvents.length === 0) return;
    markReadMutation.mutate(unreadEvents.map((e) => e._id));
  };

  return (
    <div className="bg-oled-card border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-base text-white flex items-center gap-2">
          <span>💖</span> Pet Reactions & Responses
          {unreadEvents.length > 0 && (
            <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
              {unreadEvents.length} new
            </span>
          )}
        </h3>

        {unreadEvents.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markReadMutation.isPending}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500">Checking for reactions...</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-2">
          No reactions received yet. Double-press the physical button on PocketPet when reading a message to send a heart!
        </p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {events.slice(0, 15).map((ev) => (
            <div
              key={ev._id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                !ev.readAt
                  ? "bg-rose-500/5 border-rose-500/30 text-rose-200"
                  : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {ev.reaction === "heart" ? (
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
                ) : (
                  <Smile className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  PocketPet reacted with <strong className="text-white capitalize">{ev.reaction}</strong> to command #{ev.refSeq}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date(ev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

