import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { LogOut, Dog, PlusCircle, Palette, ListMusic } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-800 bg-oled-card/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
            <span className="text-2xl">🐶</span>
            <span className="tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              PocketPet
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-400">
              <Link to="/" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-slate-800 transition">
                Devices
              </Link>
              <Link to="/editor" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                <Palette className="w-4 h-4" /> Pixel Editor
              </Link>
              <Link to="/playlists" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                <ListMusic className="w-4 h-4" /> Playlists
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/pair">
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <PlusCircle className="w-4 h-4 text-sky-400" />
                  Pair Device
                </Button>
              </Link>
              <div className="text-xs text-slate-400 hidden sm:block border-l border-slate-800 pl-3">
                {user.displayName}
              </div>
              <Button size="sm" variant="ghost" onClick={handleLogout} title="Log out">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

