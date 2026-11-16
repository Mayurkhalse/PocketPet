import { apiClient } from "./apiClient";

export const contentApi = {
  listContents: async () => {
    const res = await apiClient.get("/contents");
    return res.data;
  },
  getContent: async (id) => {
    const res = await apiClient.get(`/contents/${id}`);
    return res.data;
  },
  createContent: async (data) => {
    const res = await apiClient.post("/contents", data);
    return res.data;
  },
  updateContent: async (id, data) => {
    const res = await apiClient.patch(`/contents/${id}`, data);
    return res.data;
  },
  deleteContent: async (id) => {
    const res = await apiClient.delete(`/contents/${id}`);
    return res.data;
  },
};

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

