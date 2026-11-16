#pragma once

// Hardware Pins (ESP32-C3 SuperMini)
#define PIN_OLED_SDA 5
#define PIN_OLED_SCL 6
#define PIN_BUTTON_EXT 3     // External tactile button (INPUT_PULLUP, other leg to GND)
#define PIN_BUTTON_BOOT 9    // On-board BOOT button (INPUT_PULLUP, dev mirror)
#define PIN_BATTERY_ADC 0    // ADC1 channel, 2x 100k divider to measure 3.7V LiPo

// Display Geometry
#define OLED_W 128
#define OLED_H 64

// System Timings & Limits
#define POLL_DEFAULT_SEC 8
#define POLL_MIN_SEC 5
#define POLL_MAX_SEC 60
#define MAX_PLAYLIST_ITEMS 20
#define MAX_TEXT_LEN 64
#define BITMAP_BYTES 1024

// Button Timings
#define BTN_DEBOUNCE_MS 35
#define BTN_MULTI_GAP_MS 350
#define BTN_LONG_MS 3000
#define BTN_RESET_MS 10000

// Features
#define REACTION_WINDOW_SEC 60
#define PORTAL_TIMEOUT_MS 300000 // 5 minutes
#define SLEEP_TIMEOUT_MS 60000   // 60s idle display off
#define DIM_TIMEOUT_MS 20000     // 20s idle display dim

