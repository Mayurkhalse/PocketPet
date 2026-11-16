#include "button_manager.h"

ButtonManager::ButtonManager() {}

void ButtonManager::begin() {
  pinMode(PIN_BUTTON_EXT, INPUT_PULLUP);
  pinMode(PIN_BUTTON_BOOT, INPUT_PULLUP);
}

bool ButtonManager::readRawButton() {
  // Active LOW. Either external button (GPIO3) or BOOT button (GPIO9)
  return (digitalRead(PIN_BUTTON_EXT) == LOW || digitalRead(PIN_BUTTON_BOOT) == LOW);
}

ButtonGesture ButtonManager::update() {
  bool currentRaw = readRawButton();
  uint32_t now = millis();
  ButtonGesture gesture = ButtonGesture::NONE;

  if (currentRaw && !isPressed) {
    // Button pressed down
    isPressed = true;
    pressStartTime = now;
    longPressFired = false;
    resetPressFired = false;
  } else if (currentRaw && isPressed) {
    // Button held
    uint32_t duration = now - pressStartTime;
    if (duration >= BTN_RESET_MS && !resetPressFired) {
      resetPressFired = true;
      tapCount = 0;
      return ButtonGesture::RESET_PRESS;
    } else if (duration >= BTN_LONG_MS && !longPressFired && !resetPressFired) {
      longPressFired = true;
      tapCount = 0;
      return ButtonGesture::LONG_PRESS;
    }
  } else if (!currentRaw && isPressed) {
    // Button released
    isPressed = false;
    uint32_t duration = now - pressStartTime;

    if (!longPressFired && !resetPressFired && duration >= BTN_DEBOUNCE_MS) {
      tapCount++;
      lastReleaseTime = now;
    }
  }

  // Multi-tap evaluation window
  if (!isPressed && tapCount > 0 && (now - lastReleaseTime > BTN_MULTI_GAP_MS)) {
    if (tapCount == 1) {
      gesture = ButtonGesture::SHORT_PRESS;
    } else if (tapCount == 2) {
      gesture = ButtonGesture::DOUBLE_PRESS;
    } else if (tapCount >= 3) {
      gesture = ButtonGesture::TRIPLE_PRESS;
    }
    tapCount = 0;
  }

  return gesture;
}

