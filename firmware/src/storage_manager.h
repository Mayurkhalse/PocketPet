#pragma once

#include <Arduino.h>
#include <Preferences.h>
#include <LittleFS.h>
#include "../include/types.h"

class StorageManager {
 public:
  StorageManager();
  bool begin();

  // Wi-Fi Credentials
  bool loadWifi(WifiCreds& creds);
  bool saveWifi(const WifiCreds& creds);
  void clearWifi();

  // Device Token
  String loadDeviceToken();
  void saveDeviceToken(const String& token);
  void clearDeviceToken();

  // Command Sequence Counter
  uint32_t loadLastSeq();
  void saveLastSeq(uint32_t seq);

  // Poll Interval
  uint16_t loadPollInterval();
  void savePollInterval(uint16_t sec);

  // Playlists
  bool savePlaylist(const PlaylistData& playlist);
  bool loadPlaylist(PlaylistData& playlist);
  void clearPlaylist();

  // Factory Reset
  void factoryReset();

 private:
  Preferences prefs;
  bool littleFsMounted = false;
};

