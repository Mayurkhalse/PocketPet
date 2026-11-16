import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deviceApi } from "../services/deviceApi";
import { Button } from "../components/ui/Button";
import { Sparkles, ArrowLeft } from "lucide-react";

export function PairDevicePage() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("My PocketPet");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code from the OLED screen");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const device = await deviceApi.claimDevice({ code, name });
      navigate(`/devices/${device._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Invalid or expired pairing code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-oled-card border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-5xl block">🔗</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pair Your PocketPet</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Look at your PocketPet OLED screen. Enter the 6-digit pairing code shown in the box.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-center text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              6-Digit Pairing Code
            </label>
            <div className="flex justify-center gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 bg-slate-900 border-2 border-slate-700 focus:border-sky-400 rounded-xl text-center text-2xl font-mono font-bold text-sky-300 focus:outline-none shadow-inner"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Device Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Keychain Pup"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 text-base gap-2">
            <Sparkles className="w-4 h-4" />
            {loading ? "Pairing with Keychain..." : "Link to My Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}

