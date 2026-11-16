#include "display_manager.h"
#include "../lib/icons/icons16.h"
#include "../lib/icons/icons32.h"

DisplayManager::DisplayManager()
    : u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE, /* clock=*/ PIN_OLED_SCL, /* data=*/ PIN_OLED_SDA) {}

bool DisplayManager::begin() {
  Wire.begin(PIN_OLED_SDA, PIN_OLED_SCL);
  return u8g2.begin();
}

void DisplayManager::clear() {
  u8g2.clearBuffer();
}

void DisplayManager::display() {
  u8g2.sendBuffer();
}

void DisplayManager::setBrightness(uint8_t b) {
  u8g2.setContrast(b);
}

void DisplayManager::showBootScreen() {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB10_tr);
  u8g2.drawStr(16, 28, "PocketPet");
  u8g2.setFont(u8g2_font_5x8_tr);
  u8g2.drawStr(24, 46, "Starting up...");
  u8g2.sendBuffer();
}

void DisplayManager::showProvisioningScreen(const String& apName) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_7x14_tr);
  u8g2.drawStr(8, 16, "Setup Wi-Fi");
  u8g2.setFont(u8g2_font_5x8_tr);
  u8g2.drawStr(8, 32, "Join Wi-Fi network:");
  u8g2.setFont(u8g2_font_6x12_tr);
  u8g2.drawStr(8, 46, apName.c_str());
  u8g2.setFont(u8g2_font_5x8_tr);
  u8g2.drawStr(8, 58, "Open: 192.168.4.1");
  u8g2.sendBuffer();
}

void DisplayManager::showConnectingScreen(const String& ssid) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_7x14_tr);
  u8g2.drawStr(12, 22, "Connecting...");
  u8g2.setFont(u8g2_font_5x8_tr);
  u8g2.drawStr(12, 42, ssid.c_str());
  u8g2.sendBuffer();
}

void DisplayManager::showPairingCodeScreen(const String& code) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x12_tr);
  u8g2.drawStr(16, 16, "Pair Your Device");
  
  // Big box for 6-digit code
  u8g2.drawRFrame(14, 24, 100, 26, 4);
  u8g2.setFont(u8g2_font_logisoso16_tr);
  u8g2.drawStr(26, 44, code.c_str());

  u8g2.setFont(u8g2_font_4x6_tr);
  u8g2.drawStr(20, 60, "Enter code on PocketPet web");
  u8g2.sendBuffer();
}

void DisplayManager::showPairedScreen() {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB12_tr);
  u8g2.drawStr(24, 34, "Paired!");
  u8g2.setFont(u8g2_font_5x8_tr);
  u8g2.drawStr(28, 50, "Welcome home!");
  u8g2.sendBuffer();
}

void DisplayManager::showOfflineNotice() {
  u8g2.setFont(u8g2_font_4x6_tr);
  u8g2.drawStr(2, 8, "[OFFLINE]");
}

void DisplayManager::drawPet(int x, int y, const unsigned char* sprite) {
  u8g2.drawXBMP(x, y, 48, 48, sprite);
}

void DisplayManager::drawContentBitmap(const uint8_t* bitmap, const String& fromName) {
  u8g2.clearBuffer();
  u8g2.drawXBMP(0, 0, OLED_W, OLED_H, bitmap);
  if (fromName.length() > 0) {
    u8g2.setFont(u8g2_font_4x6_tr);
    u8g2.setDrawColor(0); // Inverted badge background
    u8g2.drawBox(0, 0, (fromName.length() + 5) * 5, 8);
    u8g2.setDrawColor(1);
    String header = "from " + fromName;
    u8g2.drawStr(2, 6, header.c_str());
  }
  u8g2.sendBuffer();
}

void DisplayManager::drawContentText(const String& text, const String& fromName) {
  u8g2.clearBuffer();

  // If text is only single icon token e.g. ":heart:"
  if (text.startsWith(":") && text.endsWith(":") && text.indexOf(":", 1) == (int)(text.length() - 1)) {
    String token = text.substring(1, text.length() - 1);
    if (token == "heart") {
      u8g2.drawXBMP(48, 16, 32, 32, icon32_heart);
    } else if (token == "smile") {
      u8g2.drawXBMP(48, 16, 32, 32, icon32_smile);
    } else {
      u8g2.drawXBMP(56, 24, 16, 16, icon16_heart);
    }
  } else {
    // Choose font size based on text length
    if (text.length() <= 16) {
      u8g2.setFont(u8g2_font_9x15_tr);
    } else if (text.length() <= 32) {
      u8g2.setFont(u8g2_font_7x14_tr);
    } else {
      u8g2.setFont(u8g2_font_6x12_tr);
    }

    int y = 24;
    int lineStart = 0;
    while (lineStart < (int)text.length() && y <= 60) {
      int nextBreak = text.indexOf('\n', lineStart);
      String line;
      if (nextBreak != -1) {
        line = text.substring(lineStart, nextBreak);
        lineStart = nextBreak + 1;
      } else {
        line = text.substring(lineStart);
        lineStart = text.length();
      }
      u8g2.drawStr(4, y, line.c_str());
      y += 15;
    }
  }

  if (fromName.length() > 0) {
    u8g2.setFont(u8g2_font_4x6_tr);
    String header = "from " + fromName;
    u8g2.drawStr(4, 8, header.c_str());
    u8g2.drawHLine(4, 10, OLED_W - 8);
  }

  u8g2.sendBuffer();
}

void DisplayManager::drawReactionSplash(const String& reaction) {
  u8g2.clearBuffer();
  if (reaction == "heart") {
    u8g2.drawXBMP(48, 16, 32, 32, icon32_heart);
  } else {
    u8g2.drawXBMP(48, 16, 32, 32, icon32_smile);
  }
  u8g2.setFont(u8g2_font_6x12_tr);
  u8g2.drawStr(36, 58, "Sent!");
  u8g2.sendBuffer();
}

