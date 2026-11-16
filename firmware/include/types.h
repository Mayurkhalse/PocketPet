#pragma once

#include <Arduino.h>
#include <vector>

enum class SystemState {
  BOOT,
  PROVISIONING,
  CONNECTING,
  REGISTERING,
  AWAITING_PAIR,
  ONLINE,
  OFFLINE_PET
};

enum class DisplaySubState {
  PET,
  CONTENT,
  PLAYLIST
};

enum class CmdType {
  SHOW_CONTENT,
  PLAY_PLAYLIST,
  STOP,
  SET_SETTINGS,
  UNPAIR,
  REBOOT,
  UNKNOWN
};

enum class ButtonGesture {
  NONE,
  SHORT_PRESS,
  DOUBLE_PRESS,
  TRIPLE_PRESS,
  LONG_PRESS,
  RESET_PRESS
};

struct WifiCreds {
  String ssid;
  String pass;
};

struct DeviceStats {
  int8_t rssi = 0;
  uint8_t battery = 100;
  String fwVersion = "1.0.0";
  String currentMode = "pet";
};

struct CommandItem {
  uint32_t seq = 0;
  CmdType type = CmdType::UNKNOWN;
  String rawType;
  String payloadJson;
  String expiresAt;
};

struct AckItem {
  uint32_t seq;
  String status; // "ok" or "error"
  String error;
};

struct PlaylistItem {
  String type; // "text" or "bitmap"
  String text;
  uint8_t* bitmap = nullptr;
  uint16_t durationSec = 5;
};

struct PlaylistData {
  String id;
  String name;
  bool repeat = false;
  std::vector<PlaylistItem> items;
};

struct ReactionEvent {
  String reaction; // "heart" or "smile"
  uint32_t refSeq;
  uint32_t timestampMs;
};

