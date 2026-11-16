import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { deviceApi } from "../services/deviceApi";
import { DeviceCard } from "../components/device/DeviceCard";
import { Button } from "../components/ui/Button";
import { PlusCircle, Loader2, RefreshCw } from "lucide-react";

export function DashboardPage() {
  const { data: devices = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["devices"],
    queryFn: deviceApi.listDevices,
    refetchInterval: 10000, // Poll device statuses every 10s
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            My PocketPets
            <button
              onClick={() => refetch()}
              className="p-1 text-slate-500 hover:text-slate-300 transition"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-sky-400" : ""}`} />
            </button>
          </h1>
          <p className="text-sm text-slate-400">
            Send live drawings, icons, and messages to your physical keychains
          </p>
        </div>

        <Link to="/pair">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" /> Pair New Keychain
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
          <p className="text-sm">Connecting to your PocketPet devices...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-oled-card border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <span className="text-6xl block">🐾</span>
          <h2 className="text-xl font-bold text-white">No PocketPet paired yet</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Turn on your physical ESP32 keychain device or launch the simulator. When the 6-digit code appears on the OLED screen, enter it to link your pet!
          </p>
          <div className="pt-2">
            <Link to="/pair">
              <Button size="lg" className="gap-2">
                <PlusCircle className="w-5 h-5" /> Pair My First Pet
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard key={device._id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}

