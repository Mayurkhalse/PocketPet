import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { PairDevicePage } from "../pages/PairDevicePage";
import { DeviceDetailPage } from "../pages/DeviceDetailPage";
import { ComposePage } from "../pages/ComposePage";
import { EditorPage } from "../pages/EditorPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { InviteAcceptPage } from "../pages/InviteAcceptPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/invite/:code" element={<InviteAcceptPage />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pair" element={<PairDevicePage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
        <Route path="/devices/:id/compose" element={<ComposePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

