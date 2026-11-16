import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("pocketpet_user") || "null"),
  token: localStorage.getItem("pocketpet_token") || null,

  setAuth: (user, token) => {
    localStorage.setItem("pocketpet_user", JSON.stringify(user));
    localStorage.setItem("pocketpet_token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("pocketpet_user");
    localStorage.removeItem("pocketpet_token");
    set({ user: null, token: null });
  },
}));

