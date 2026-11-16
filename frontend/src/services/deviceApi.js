import { apiClient } from "./apiClient";

export const deviceApi = {
  listDevices: async () => {
    const res = await apiClient.get("/devices");
    return res.data;
  },
  claimDevice: async ({ code, name }) => {
    const res = await apiClient.post("/devices/claim", { code, name });
    return res.data;
  },
  getDevice: async (id) => {
    const res = await apiClient.get(`/devices/${id}`);
    return res.data;
  },
  updateDevice: async (id, data) => {
    const res = await apiClient.patch(`/devices/${id}`, data);
    return res.data;
  },
  unpairDevice: async (id) => {
    const res = await apiClient.delete(`/devices/${id}`);
    return res.data;
  },
  getMembers: async (id) => {
    const res = await apiClient.get(`/devices/${id}/members`);
    return res.data;
  },
  createInvite: async (id) => {
    const res = await apiClient.post(`/devices/${id}/invites`);
    return res.data;
  },
  acceptInvite: async (code) => {
    const res = await apiClient.post("/invites/accept", { code });
    return res.data;
  },
  removeMember: async (id, userId) => {
    const res = await apiClient.delete(`/devices/${id}/members/${userId}`);
    return res.data;
  },
  sendContent: async (id, data) => {
    const res = await apiClient.post(`/devices/${id}/commands/content`, data);
    return res.data;
  },
  sendPlaylist: async (id, data) => {
    const res = await apiClient.post(`/devices/${id}/commands/playlist`, data);
    return res.data;
  },
  sendStop: async (id) => {
    const res = await apiClient.post(`/devices/${id}/commands/stop`);
    return res.data;
  },
  listCommands: async (id, query = {}) => {
    const res = await apiClient.get(`/devices/${id}/commands`, { params: query });
    return res.data;
  },
  getCommandStatus: async (id, cmdId) => {
    const res = await apiClient.get(`/devices/${id}/commands/${cmdId}`);
    return res.data;
  },
  getEvents: async (id, unreadOnly = false) => {
    const res = await apiClient.get(`/devices/${id}/events`, {
      params: { unread: unreadOnly },
    });
    return res.data;
  },
  markEventsRead: async (id, ids) => {
    const res = await apiClient.post(`/devices/${id}/events/read`, { ids });
    return res.data;
  },
};

