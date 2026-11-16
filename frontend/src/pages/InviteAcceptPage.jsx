import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deviceApi } from "../services/deviceApi";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Users, Sparkles, CheckCircle2 } from "lucide-react";

export function InviteAcceptPage() {
  const { code } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successDevice, setSuccessDevice] = useState(null);

  const handleAccept = async () => {
    setError("");
    setLoading(true);

    try {
      const device = await deviceApi.acceptInvite(code);
      setSuccessDevice(device);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Invalid or expired invite link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-oled-card border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <span className="text-5xl block">💌</span>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">PocketPet Invitation</h1>
          <p className="text-xs text-slate-400">
            You've been invited to send messages, pixel drawings, and emojis to a friend's keychain!
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-sm font-bold text-sky-400">
          Invite Code: {code}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl">
            {error}
          </div>
        )}

        {successDevice ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>You now have sender access to <strong>{successDevice.name}</strong>!</span>
            </div>
            <Link to={`/devices/${successDevice._id}`}>
              <Button className="w-full">Open Device Dashboard</Button>
            </Link>
          </div>
        ) : !user ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Please log in or register to accept this invite:</p>
            <div className="flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="secondary" className="w-full">Log In</Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          </div>
        ) : (
          <Button onClick={handleAccept} disabled={loading} className="w-full py-3 gap-2">
            <Sparkles className="w-4 h-4" />
            {loading ? "Accepting..." : "Accept Invitation & Connect"}
          </Button>
        )}
      </div>
    </div>
  );
}

