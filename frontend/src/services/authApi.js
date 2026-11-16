import { apiClient } from "./apiClient";

export const authApi = {
  register: async (data) => {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  },
  login: async (data) => {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
};

