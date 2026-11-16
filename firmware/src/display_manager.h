#pragma once

#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>
#include "../include/config.h"

class DisplayManager {
 public:
  DisplayManager();
  bool begin();
  void clear();
  void display();
  void setBrightness(uint8_t b);

  // Status Screens
  void showBootScreen();
  void showProvisioningScreen(const String& apName);
  void showConnectingScreen(const String& ssid);
  void showPairingCodeScreen(const String& code);
  void showPairedScreen();
  void showOfflineNotice();

  // Content & Playback
  void drawPet(int x, int y, const unsigned char* sprite);
  void drawContentText(const String& text, const String& fromName = "");
  void drawContentBitmap(const uint8_t* bitmap, const String& fromName = "");
  void drawReactionSplash(const String& reaction);

  // U8g2 instance accessor
  U8G2& getU8g2() { return u8g2; }

 private:
  U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2;
  void pickBestFont(const String& text);
};

