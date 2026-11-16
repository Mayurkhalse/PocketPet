import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceApi } from "../../services/deviceApi";
import { Button } from "../ui/Button";
import { Users, UserPlus, Copy, Check, Trash2, Crown } from "lucide-react";

export function MembersPanel({ deviceId }) {
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState(null);
  const [createdInvite, setCreatedInvite] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["device-members", deviceId],
    queryFn: () => deviceApi.getMembers(deviceId),
  });

  const inviteMutation = useMutation({
    mutationFn: () => deviceApi.createInvite(deviceId),
    onSuccess: (res) => {
      setCreatedInvite(res);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (targetUserId) => deviceApi.removeMember(deviceId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries(["device-members", deviceId]);
    },
  });

  const handleCopyLink = (code) => {
    const link = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const isOwner = data?.currentUserRole === "owner";

  return (
    <div className="bg-oled-card border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-base text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          Device Sharing & Senders
        </h3>

        {isOwner && (
          <Button
            size="sm"
            onClick={() => inviteMutation.mutate()}
            disabled={inviteMutation.isPending}
            className="gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite Friend
          </Button>
        )}
      </div>

      {createdInvite && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-sky-300">Invite link generated (valid 48h):</span>
            <span className="font-mono font-bold text-sky-400">{createdInvite.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/invite/${createdInvite.code}`}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono w-full"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopyLink(createdInvite.code)}
              className="gap-1 text-xs shrink-0"
            >
              {copiedCode === createdInvite.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode === createdInvite.code ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-500">Loading members...</p>
      ) : (
        <div className="space-y-2">
          {/* Owner */}
          {data?.owner && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-medium text-white">{data.owner.displayName}</div>
                  <div className="text-[11px] text-slate-500">{data.owner.email}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Owner
              </span>
            </div>
          )}

          {/* Senders */}
          {data?.members?.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">👤</span>
                <div>
                  <div className="font-medium text-white">{m.displayName}</div>
                  <div className="text-[11px] text-slate-500">{m.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  Sender
                </span>
                {isOwner && (
                  <button
                    onClick={() => removeMemberMutation.mutate(m.userId)}
                    title="Remove access"
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {(!data?.members || data.members.length === 0) && (
            <p className="text-xs text-slate-500 italic py-1">
              No friends invited yet. Generate an invite link above to let family or friends send pixel messages!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

