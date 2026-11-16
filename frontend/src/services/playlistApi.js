import { apiClient } from "./apiClient";

export const playlistApi = {
  listPlaylists: async () => {
    const res = await apiClient.get("/playlists");
    return res.data;
  },
  getPlaylist: async (id) => {
    const res = await apiClient.get(`/playlists/${id}`);
    return res.data;
  },
  createPlaylist: async (data) => {
    const res = await apiClient.post("/playlists", data);
    return res.data;
  },
  updatePlaylist: async (id, data) => {
    const res = await apiClient.put(`/playlists/${id}`, data);
    return res.data;
  },
  deletePlaylist: async (id) => {
    const res = await apiClient.delete(`/playlists/${id}`);
    return res.data;
  },
};

