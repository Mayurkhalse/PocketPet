import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceApi } from "../services/deviceApi";
import { StatusBadge } from "../components/device/StatusBadge";
import { ReactionFeed } from "../components/device/ReactionFeed";
import { MembersPanel } from "../components/device/MembersPanel";
import { Button } from "../components/ui/Button";
import {
  Send,
  Palette,
  ArrowLeft,
  Settings,
  Trash2,
  ListOrdered,
  Square,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview"); // overview, history, settings
  const [name, setName] = useState("");
  const [brightness, setBrightness] = useState(255);

  const { data: device, isLoading } = useQuery({
    queryKey: ["device", id],
    queryFn: () => deviceApi.getDevice(id),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (device) {
      setName(device.name || "");
      setBrightness(device.settings?.brightness ?? 255);
    }
  }, [device]);

  const { data: commandsData } = useQuery({
    queryKey: ["device-commands", id],
    queryFn: () => deviceApi.listCommands(id),
    refetchInterval: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => deviceApi.updateDevice(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["device", id]);
      alert("Settings updated!");
    },
  });

  const unpairMutation = useMutation({
    mutationFn: () => deviceApi.unpairDevice(id),
    onSuccess: () => {
      navigate("/");
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => deviceApi.sendStop(id),
    onSuccess: () => {
      alert("Sent STOP command to pet!");
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading device details...</div>;
  }

  if (!device) {
    return <div className="p-8 text-center text-rose-400">Device not found</div>;
  }

  const isOwner = device.userRole === "owner";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> All Devices
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => stopMutation.mutate()}
            disabled={stopMutation.isPending}
            className="gap-1.5 text-xs"
            title="Return to Pet Mode immediately"
          >
            <Square className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Stop / Pet Mode
          </Button>
          <Link to={`/devices/${id}/compose`}>
            <Button size="sm" className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Send Message
            </Button>
          </Link>
          <Link to="/editor">
            <Button size="sm" variant="secondary" className="gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-400" /> Draw Pixel Art
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-oled-card border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐶</span>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {device.name}
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {device.userRole}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-mono">Hardware ID: {device.hardwareId}</p>
            </div>
          </div>

          <div className="pt-2">
            <StatusBadge
              online={device.online}
              lastSeenAt={device.status?.lastSeenAt}
              battery={device.status?.battery}
              rssi={device.status?.rssi}
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "overview" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Overview & Activity
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "history" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Command History
          </button>
          {isOwner && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "settings" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Settings
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReactionFeed deviceId={id} />
          <MembersPanel deviceId={id} />
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-oled-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-sky-400" />
            Sent Message History
          </h3>

          {commandsData?.items?.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No commands sent to this device yet.</p>
          ) : (
            <div className="space-y-2">
              {commandsData?.items?.map((cmd) => (
                <div
                  key={cmd._id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">#{cmd.seq}</span>
                      <span className="font-semibold text-white">{cmd.type}</span>
                      {cmd.payload?.fromName && (
                        <span className="text-[11px] text-slate-400">from {cmd.payload.fromName}</span>
                      )}
                    </div>
                    {cmd.payload?.text && (
                      <p className="font-mono text-sky-300 text-xs">"{cmd.payload.text}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    {cmd.status === "acked" && (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Displayed
                      </span>
                    )}
                    {cmd.status === "delivered" && (
                      <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">
                        <Clock className="w-3 h-3" /> Delivered
                      </span>
                    )}
                    {cmd.status === "pending" && (
                      <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                    {cmd.status === "failed" && (
                      <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && isOwner && (
        <div className="bg-oled-card border border-slate-800 rounded-3xl p-6 shadow-xl max-w-xl mx-auto space-y-6">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-5 h-5 text-sky-400" />
            Device Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Keychain Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Display Brightness</span>
                <span className="font-mono text-sky-400">{brightness} / 255</span>
              </div>
              <input
                type="range"
                min="10"
                max="255"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <Button
              onClick={() => updateMutation.mutate({ name, settings: { brightness } })}
              disabled={updateMutation.isPending}
              className="w-full"
            >
              Save Changes
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Danger Zone</h4>
            <p className="text-xs text-slate-400">
              Unpairing releases this device from your account so it can be claimed by someone else or re-paired.
            </p>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Are you sure you want to unpair this PocketPet?")) {
                  unpairMutation.mutate();
                }
              }}
              className="w-full gap-2"
            >
              <Trash2 className="w-4 h-4" /> Unpair PocketPet Keychain
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

