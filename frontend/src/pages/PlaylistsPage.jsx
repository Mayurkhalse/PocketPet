import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistApi } from "../services/playlistApi";
import { deviceApi } from "../services/deviceApi";
import { Button } from "../components/ui/Button";
import { ListMusic, Plus, Play, Trash2, Repeat, Clock } from "lucide-react";

export function PlaylistsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [items, setItems] = useState([
    { type: "text", text: "Good morning! :sun:", durationSec: 5 },
    { type: "text", text: "Have a great day :paw:", durationSec: 5 },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: playlistApi.listPlaylists,
  });

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

  const createMutation = useMutation({
    mutationFn: (data) => playlistApi.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["playlists"]);
      setIsCreating(false);
      setName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => playlistApi.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["playlists"]);
    },
  });

  const playMutation = useMutation({
    mutationFn: ({ deviceId, playlistId }) =>
      deviceApi.sendPlaylist(deviceId, { playlistId }),
    onSuccess: () => {
      alert("Playlist sent to keychain!");
    },
  });

  const handleAddItem = () => {
    if (items.length >= 20) return;
    setItems([...items, { type: "text", text: "New slide :heart:", durationSec: 5 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || items.length === 0) return;
    createMutation.mutate({ name, repeat, items });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListMusic className="w-6 h-6 text-sky-400" />
            Keychain Playlists
          </h1>
          <p className="text-xs text-slate-400">
            Create ordered slideshows that play locally on your PocketPet keychain
          </p>
        </div>

        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "Create Playlist"}
        </Button>
      </div>

      {/* Playlist Creation Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-oled-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5"
        >
          <h3 className="font-semibold text-base text-white border-b border-slate-800 pb-2">
            New Playlist
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Playlist Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily Motivation"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="repeat"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
                className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
              />
              <label htmlFor="repeat" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-sky-400" /> Loop indefinitely
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Playlist Items ({items.length}/20)</span>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={items.length >= 20}
                className="text-sky-400 hover:text-sky-300 font-medium"
              >
                + Add Slide
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3 text-xs"
                >
                  <span className="font-mono text-slate-500 font-bold">{idx + 1}</span>
                  <input
                    type="text"
                    value={it.text}
                    onChange={(e) => handleItemChange(idx, "text", e.target.value)}
                    placeholder="Slide text (e.g. You are awesome! :heart:)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={it.durationSec}
                      onChange={(e) => handleItemChange(idx, "durationSec", Number(e.target.value))}
                      className="w-12 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-center text-white"
                    />
                    <span>s</span>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button type="submit" disabled={createMutation.isPending}>
              Save Playlist
            </Button>
          </div>
        </form>
      )}

      {/* Playlist List */}
      <div className="space-y-4">
        {playlists.length === 0 ? (
          <div className="bg-oled-card border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs italic">
            No playlists created yet. Click "Create Playlist" above to assemble your first slideshow!
          </div>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl._id}
              className="bg-oled-card border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-white flex items-center gap-2">
                  {pl.name}
                  {pl.repeat && (
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Repeat className="w-3 h-3" /> Loops
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {pl.items?.length || 0} items • Total duration:{" "}
                  {pl.items?.reduce((sum, it) => sum + (it.durationSec || 0), 0)}s
                </p>
              </div>

              <div className="flex items-center gap-3">
                {devices.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() =>
                      playMutation.mutate({
                        deviceId: selectedDeviceId || devices[0]._id,
                        playlistId: pl._id,
                      })
                    }
                    className="gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Play on Keychain
                  </Button>
                )}

                <button
                  onClick={() => deleteMutation.mutate(pl._id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  title="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

