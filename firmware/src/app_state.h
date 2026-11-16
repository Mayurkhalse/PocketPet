#pragma once

#include <Arduino.h>
#include "../include/types.h"
#include "display_manager.h"
#include "button_manager.h"
#include "wifi_manager.h"
#include "provisioning.h"
#include "cloud_client.h"
#include "storage_manager.h"
#include "pet_animation.h"
#include "power_manager.h"

class AppState {
 public:
  AppState();
  void begin();
  void loop();

 private:
  SystemState state = SystemState::BOOT;
  DisplaySubState displayMode = DisplaySubState::PET;

  DisplayManager display;
  ButtonManager button;
  WifiManager wifi;
  Provisioning provisioning;
  CloudClient cloud;
  StorageManager storage;
  PetAnimation pet;
  PowerManager power;

  WifiCreds wifiCreds;
  String deviceToken;
  String pairingCode;
  uint32_t lastSeq = 0;
  uint16_t pollIntervalSec = 8;
  uint32_t lastPollTime = 0;
  uint32_t lastActivityTime = 0;

  // Active content state
  bool contentActive = false;
  uint32_t contentEndTime = 0;
  uint32_t lastDisplayedSeq = 0;
  uint32_t lastContentStartTime = 0;

  // Playlist playback state
  PlaylistData currentPlaylist;
  bool playlistActive = false;
  size_t playlistItemIndex = 0;
  uint32_t playlistItemEndTime = 0;

  void handleButtonGesture(ButtonGesture gesture);
  void executeCommand(const CommandItem& cmd);
  void executeShowContent(const String& payloadJson, uint32_t seq);
  void executePlayPlaylist(const String& payloadJson, uint32_t seq);
  void executeSetSettings(const String& payloadJson, uint32_t seq);
  void triggerReaction(const String& reactionType);
};

