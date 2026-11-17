# 🔌 PocketPet Hardware Wiring Guide

## Board: ESP32-C3 SuperMini

### Pinout Mapping

| Component | Pin / Signal | ESP32-C3 GPIO | Description / Notes |
|-----------|--------------|---------------|---------------------|
| **OLED (SSD1306 128x64 I2C)** | VCC | 3.3V | Screen logic & display power |
| | GND | GND | Common ground |
| | SCK (or SCL / CLK) | GPIO 6 | I2C Clock (Hardware I2C) |
| | SDA | GPIO 5 | I2C Data (Hardware I2C) |
| **Tactile Button (External)** | Leg 1 | GPIO 3 | Configured as `INPUT_PULLUP` |
| | Leg 2 | GND | Press pulls GPIO 3 to LOW |
| **On-board BOOT Button** | BOOT | GPIO 9 | Software mirrors GPIO 3 for dev convenience |
| **Battery Voltage Divider** | V_BAT | GPIO 0 | ADC1 channel; 2x 100kΩ divider to measure 3.7V LiPo |
| **Power Input** | VBAT / 5V | 3.7V - 5V | TP4056 charge board output or 5V USB |

> **Note on Strapping Pins:** GPIO 2, 8, and 9 are strapping pins on ESP32-C3. GPIO 8 controls the on-board LED. That is why I2C was assigned to GPIO 5 and 6, and the external user button to GPIO 3.

