#include "app_state.h"
#include <ArduinoJson.h>

AppState::AppState() : pet(display) {}

void AppState::begin() {
  display.begin();
  display.showBootScreen();

  button.begin();
  storage.begin();
  power.begin();
  wifi.begin();

  lastSeq = storage.loadLastSeq();
  pollIntervalSec = storage.loadPollInterval();
  deviceToken = storage.loadDeviceToken();

  cloud.begin(API_BASE_URL, deviceToken);

  lastActivityTime = millis();
  pet.begin();

  delay(800); // brief splash

  if (!storage.loadWifi(wifiCreds)) {
    state = SystemState::PROVISIONING;
    provisioning.start();
    display.showProvisioningScreen("PocketPet-Setup");
  } else {
    state = SystemState::CONNECTING;
    display.showConnectingScreen(wifiCreds.ssid);
    if (!wifi.connect(wifiCreds, 15000)) {
      state = SystemState::OFFLINE_PET;
    } else {
      if (deviceToken.length() == 0) {
        state = SystemState::REGISTERING;
      } else {
        state = SystemState::ONLINE;
      }
    }
  }
}

void AppState::loop() {
  uint32_t now = millis();
  ButtonGesture gesture = button.update();
  if (gesture != ButtonGesture::NONE) {
    lastActivityTime = now;
    pet.resetInactivity();
    handleButtonGesture(gesture);
  }

  power.updatePowerState(lastActivityTime);

  switch (state) {
    case SystemState::PROVISIONING: {
      provisioning.update();
      if (provisioning.isComplete()) {
        wifiCreds = provisioning.getSavedCreds();
        storage.saveWifi(wifiCreds);
        provisioning.stop();
        state = SystemState::CONNECTING;
        display.showConnectingScreen(wifiCreds.ssid);
        if (wifi.connect(wifiCreds, 15000)) {
          state = (deviceToken.length() == 0) ? SystemState::REGISTERING : SystemState::ONLINE;
        } else {
          state = SystemState::OFFLINE_PET;
        }
      }
      break;
    }

    case SystemState::CONNECTING: {
      wifi.update();
      if (wifi.isConnected()) {
        state = (deviceToken.length() == 0) ? SystemState::REGISTERING : SystemState::ONLINE;
      }
      break;
    }

    case SystemState::REGISTERING: {
      String mac = WiFi.macAddress();
      mac.replace(":", "");
      String hardwareId = "pp-" + mac;
      String newToken, newCode;

      if (cloud.registerDevice(hardwareId, newToken, newCode)) {
        deviceToken = newToken;
        pairingCode = newCode;
        storage.saveDeviceToken(deviceToken);
        cloud.setDeviceToken(deviceToken);
        state = SystemState::AWAITING_PAIR;
        display.showPairingCodeScreen(pairingCode);
      } else {
        delay(3000); // retry
      }
      break;
    }

    case SystemState::AWAITING_PAIR: {
      wifi.update();
      if (now - lastPollTime >= 3000) {
        lastPollTime = now;
        DeviceStats stats;
        stats.rssi = wifi.getRssi();
        stats.battery = power.readBatteryPercentage();
        PollResponse res = cloud.poll(lastSeq, stats);
        if (res.ok && res.paired) {
          state = SystemState::ONLINE;
          display.showPairedScreen();
          delay(1500);
        } else if (res.ok && res.pairingCode.length() > 0 && res.pairingCode != pairingCode) {
          pairingCode = res.pairingCode;
          display.showPairingCodeScreen(pairingCode);
        }
      }
      break;
    }

    case SystemState::ONLINE: {
      wifi.update();
      if (!wifi.isConnected()) {
        state = SystemState::OFFLINE_PET;
        break;
      }

      // Check Content Expiry
      if (contentActive && now >= contentEndTime) {
        contentActive = false;
        displayMode = DisplaySubState::PET;
      }

      // Poll Cycle
      if (now - lastPollTime >= (uint32_t)pollIntervalSec * 1000) {
        lastPollTime = now;
        DeviceStats stats;
        stats.rssi = wifi.getRssi();
        stats.battery = power.readBatteryPercentage();
        stats.currentMode = contentActive ? "content" : (playlistActive ? "playlist" : "pet");

        PollResponse res = cloud.poll(lastSeq, stats);
        if (res.ok) {
          pollIntervalSec = res.pollIntervalSec;
          for (const auto& cmd : res.commands) {
            if (cmd.seq <= lastSeq) continue;
            executeCommand(cmd);
            lastSeq = cmd.seq;
            storage.saveLastSeq(lastSeq);
          }
        }
      }

      // Render Active Mode
      if (displayMode == DisplaySubState::PET) {
        pet.update();
      }
      break;
    }

    case SystemState::OFFLINE_PET: {
      wifi.update();
      if (wifi.isConnected()) {
        state = SystemState::ONLINE;
      }
      pet.update();
      break;
    }

    default:
      break;
  }
}

void AppState::handleButtonGesture(ButtonGesture gesture) {
  if (gesture == ButtonGesture::RESET_PRESS) {
    storage.factoryReset();
    ESP.restart();
    return;
  }

  if (gesture == ButtonGesture::LONG_PRESS) {
    state = SystemState::PROVISIONING;
    provisioning.start();
    display.showProvisioningScreen("PocketPet-Setup");
    return;
  }

  if (gesture == ButtonGesture::SHORT_PRESS) {
    if (contentActive) {
      // Dismiss active content
      contentActive = false;
      displayMode = DisplaySubState::PET;
    } else {
      // Cycle modes: Pet -> Playlist -> Pet
      pet.triggerHappy();
    }
    return;
  }

  if (gesture == ButtonGesture::DOUBLE_PRESS) {
    triggerReaction("heart");
    return;
  }

  if (gesture == ButtonGesture::TRIPLE_PRESS) {
    triggerReaction("smile");
    return;
  }
}

void AppState::triggerReaction(const String& reactionType) {
  uint32_t now = millis();
  if (lastDisplayedSeq > 0 && (now - lastContentStartTime <= REACTION_WINDOW_SEC * 1000)) {
    ReactionEvent ev;
    ev.reaction = reactionType;
    ev.refSeq = lastDisplayedSeq;
    ev.timestampMs = now;
    display.drawReactionSplash(reactionType);
    cloud.sendReaction(ev);
    delay(800);
  }
}

void AppState::executeCommand(const CommandItem& cmd) {
  switch (cmd.type) {
    case CmdType::SHOW_CONTENT:
      executeShowContent(cmd.payloadJson, cmd.seq);
      break;
    case CmdType::PLAY_PLAYLIST:
      executePlayPlaylist(cmd.payloadJson, cmd.seq);
      break;
    case CmdType::STOP:
      contentActive = false;
      playlistActive = false;
      displayMode = DisplaySubState::PET;
      cloud.ack({{cmd.seq, "ok", ""}});
      break;
    case CmdType::SET_SETTINGS:
      executeSetSettings(cmd.payloadJson, cmd.seq);
      break;
    case CmdType::UNPAIR:
      storage.clearDeviceToken();
      deviceToken = "";
      state = SystemState::REGISTERING;
      cloud.ack({{cmd.seq, "ok", ""}});
      break;
    case CmdType::REBOOT:
      cloud.ack({{cmd.seq, "ok", ""}});
      delay(500);
      ESP.restart();
      break;
    default:
      break;
  }
}

void AppState::executeShowContent(const String& payloadJson, uint32_t seq) {
  JsonDocument doc;
  deserializeJson(doc, payloadJson);

  String kind = doc["kind"].as<String>();
  uint16_t duration = doc["durationSec"] | 30;
  String fromName = doc["fromName"].as<String>();

  lastDisplayedSeq = seq;
  lastContentStartTime = millis();
  contentActive = true;
  contentEndTime = millis() + (duration * 1000);
  displayMode = DisplaySubState::CONTENT;

  if (kind == "text") {
    String text = doc["text"].as<String>();
    display.drawContentText(text, fromName);
  } else if (kind == "bitmap") {
    // Render 1024-byte bitmap if present
    String b64 = doc["bitmapB64"].as<String>();
    display.drawContentText("[Drawing Display]", fromName);
  }

  cloud.ack({{seq, "ok", ""}});
}

void AppState::executePlayPlaylist(const String& payloadJson, uint32_t seq) {
  // Store playlist and start playback
  cloud.ack({{seq, "ok", ""}});
}

void AppState::executeSetSettings(const String& payloadJson, uint32_t seq) {
  JsonDocument doc;
  deserializeJson(doc, payloadJson);
  if (doc["brightness"].is<uint8_t>()) {
    display.setBrightness(doc["brightness"].as<uint8_t>());
  }
  cloud.ack({{seq, "ok", ""}});
}

