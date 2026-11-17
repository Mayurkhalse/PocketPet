# 🛠️ PocketPet — Complete Hardware & Software Setup Guide

This guide covers everything required to assemble the physical hardware, flash the firmware to your **ESP32-C3 SuperMini**, run the backend & frontend locally, and deploy to the cloud.

---

## 📑 Table of Contents
1. [Hardware Bill of Materials](#1-hardware-bill-of-materials)
2. [Direct Hardware Wiring](#2-direct-hardware-wiring)
3. [Firmware Setup & Flashing (ESP32-C3)](#3-firmware-setup--flashing-esp32-c3)
4. [Backend Setup (Node.js & MongoDB)](#4-backend-setup-nodejs--mongodb)
5. [Frontend Setup (React & Vite)](#5-frontend-setup-react--vite)
6. [Complete End-to-End Walkthrough (How to Use It)](#6-complete-end-to-end-walkthrough-how-to-use-it)
7. [Cloud Deployment Guide (Render, Vercel & MongoDB Atlas)](#7-cloud-deployment-guide)

---

## 1. Hardware Bill of Materials

| Component | Specification | Description |
| :--- | :--- | :--- |
| **Microcontroller** | **ESP32-C3 SuperMini** | Tiny postage-stamp board with RISC-V core, built-in Wi-Fi & Bluetooth, and USB-C port. |
| **Display** | **0.96 inch SSD1306 OLED** | 128×64 monochrome screen with 4-pin I²C interface (`GND`, `VCC`, `SCL`, `SDA`). |
| **Battery** | **3.7V Lithium Battery (350 mAh)** | LiPo or Li-ion cell. |
| **Charger** | **HW-373 V1.2.1 (TP4056)** | Charging and protection board with USB-C input and battery over-discharge protection. |
| **User Button** | **Tactile Momentary Push Button** | 2-pin or 4-pin tactile micro-switch. *(The on-board BOOT button on GPIO 9 also mirrors this during dev).* |
| **Wiring** | **28–30 AWG Stranded Wire** | Flexible silicone wire for compact keychain assembly. |

---

## 2. Direct Hardware Wiring

No external resistors are needed. All connections are direct board-to-board wires:

```
                      ┌─────────────────────────────────┐
                      │    HW-373 (TP4056 Module)       │
                      │                                 │
                      │       [ USB-C Charger ]         │
                      │                                 │
   [ 350 mAh LiPo + ] ──► B+                       OUT+ ├──► ESP32-C3 "5V" pin
   [ 350 mAh LiPo - ] ──► B-                       OUT- ├──► ESP32-C3 "GND" pin
                      └─────────────────────────────────┘

                      ┌─────────────────────────────────┐
                      │        ESP32-C3 SuperMini       │
                      │                                 │
                      │  3.3V ──────────────────────────┼──► OLED "VCC"
                      │  GND  ──────────────────────────┼──► OLED "GND"
                      │  GPIO 5 (SDA) ──────────────────┼──► OLED "SDA"
                      │  GPIO 6 (SCL) ──────────────────┼──► OLED "SCK / SCL"
                      │                                 │
                      │  GPIO 3 ────────[ Tactile ]─────┤
                      │  GND    ────────[ Button  ]─────┘
                      └─────────────────────────────────┘
```

### Complete Pin Connection Table

| From Component | Pin Name | To Component | Pin Name | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **350 mAh Battery** | Red Wire (+) | **HW-373 Module** | **`B+`** | Battery positive |
| **350 mAh Battery** | Black Wire (-) | **HW-373 Module** | **`B-`** | Battery negative |
| **HW-373 Module** | **`OUT+`** | **ESP32-C3** | **`5V` (or `VBUS`)** | Power supply (ESP32 regulator steps it down to 3.3V) |
| **HW-373 Module** | **`OUT-`** | **ESP32-C3** | **`GND`** | Common ground |
| **0.96" OLED** | **`VCC`** | **ESP32-C3** | **`3.3V`** | Display logic power |
| **0.96" OLED** | **`GND`** | **ESP32-C3** | **`GND`** | Ground |
| **0.96" OLED** | **`SDA`** | **ESP32-C3** | **`GPIO 5`** | Hardware I²C Data |
| **0.96" OLED** | **`SCK` (or `SCL`)** | **ESP32-C3** | **`GPIO 6`** | Hardware I²C Clock (labeled SCK, SCL, or CLK) |
| **Tactile Button** | Leg 1 | **ESP32-C3** | **`GPIO 3`** | Configured as `INPUT_PULLUP` in firmware |
| **Tactile Button** | Leg 2 | **ESP32-C3** | **`GND`** | Ground |

> [!NOTE]
> **Prototyping without the tactile button:**  
> The ESP32-C3 SuperMini's onboard **BOOT button (GPIO 9)** is mirrored in the code. You can test short presses, double presses, and 3-second holds directly using the onboard BOOT button!

> [!TIP]
> **Charging Current Advice for 350 mAh Batteries:**  
> Standard TP4056 boards charge at 1000 mA (1A) out of the box. For a 350 mAh battery, a lower charge current (~300–400 mA) is ideal for battery lifespan. If you are comfortable with micro-soldering, you can swap the small `R3` / `Rprog` SMD resistor on the HW-373 module to a **3.3kΩ or 4.7kΩ** resistor. If kept standard, avoid leaving it charging unattended on high-wattage fast chargers.

---

## 3. Firmware Setup & Flashing (ESP32-C3)

### Step 3.1: Install VS Code and the PlatformIO Extension
1. Open **Visual Studio Code**.
2. Go to the **Extensions Marketplace** (`Ctrl + Shift + X`).
3. Search for **PlatformIO IDE** and click **Install**.
4. Restart VS Code when prompted.

---

### Step 3.2: Configure API Endpoint (`secrets.h`)
The ESP32-C3 needs to know where your backend server is hosted.

1. Navigate to the `firmware/include/` directory.
2. Copy `secrets.example.h` and rename it to `secrets.h`:
   ```powershell
   Copy-Item firmware/include/secrets.example.h firmware/include/secrets.h
   ```
3. Open `firmware/include/secrets.h` in your editor.
4. Set `API_BASE_URL`:
   - **For Local Testing:** The ESP32 is a separate device on your home network; it **cannot** reach `localhost`. You must enter your computer's local Wi-Fi IPv4 address (run `ipconfig` in PowerShell to find it):
     ```cpp
     #define API_BASE_URL "http://192.168.1.XX:8080/api/v1"
     ```
   - **For Cloud Deployed Backend:**
     ```cpp
     #define API_BASE_URL "https://your-pocketpet-api.onrender.com/api/v1"
     ```

---

### Step 3.3: Connect ESP32-C3 via USB-C
1. Connect the ESP32-C3 SuperMini to your computer with a **data-capable USB-C cable**.
2. **If your board is new or not recognized:**
   - Press and hold the physical **BOOT** button on the SuperMini.
   - Plug in the USB cable (or tap the **RESET** button).
   - Release the **BOOT** button. This enters ROM Bootloader Mode.

---

### Step 3.4: Flash Firmware & LittleFS Portal Assets
Open the `firmware/` folder in PlatformIO (or open the root `PocketPet` workspace):

1. Click the **PlatformIO Alien Icon** on the left activity bar.
2. Under **Project Tasks → esp32c3 → General**:
   - Click **`Upload`** (compiles code and uploads firmware).
   - Click **`Upload Filesystem Image`** (`uploadfs`) — **critical step!** This writes the LittleFS captive portal webpage (`index.html` & `style.css`) to the ESP32 flash memory.
3. Click **`Monitor`** (115200 baud) to view real-time boot logs.

---

## 4. Backend Setup (Node.js & MongoDB)

### Step 4.1: Install Dependencies
Open a PowerShell terminal in the repository root:
```powershell
cd backend
npm install
```

### Step 4.2: Configure Environment (`.env`)
A default `.env` file is ready for local development. If needed, customize `backend/.env`:
```ini
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/pocketpet
JWT_SECRET=super-secret-development-jwt-key-replace-in-production
JWT_TTL=30d
FRONTEND_ORIGIN=http://localhost:5173
DEVICE_POLL_DEFAULT_SEC=8
PAIRING_CODE_TTL_MIN=10
COMMAND_TTL_MIN=60
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your `mongodb+srv://...` connection string).*

### Step 4.3: Seed Demo Account
Run the database seed script:
```powershell
npm run seed
```
This automatically registers a verified demo user in MongoDB:
- **Email:** `demo@pocketpet.dev`
- **Password:** `password123`

### Step 4.4: Start the API Server
```powershell
npm start
```
The server will start on `http://localhost:8080`. Verify it is alive by opening `http://localhost:8080/healthz` in your browser.

> [!TIP]
> **Simulating hardware without building it:**  
> In a separate terminal, run `npm run simulate`. A full terminal keychain emulator will boot with an ASCII OLED screen and register with the backend!

---

## 5. Frontend Setup (React & Vite)

### Step 5.1: Install Dependencies
Open a new PowerShell terminal:
```powershell
cd frontend
npm install
```

### Step 5.2: Configure Environment
Ensure `frontend/.env` points to your backend:
```ini
VITE_API_URL=http://localhost:8080/api/v1
```

### Step 5.3: Start Vite Dev Server
```powershell
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 6. Complete End-to-End Walkthrough (How to Use It)

### Step 1: Wi-Fi Provisioning on the Keychain
1. Power on your PocketPet (or connect USB).
2. The OLED screen displays:
   ```
   Setup Wi-Fi
   Join Wi-Fi network:
   PocketPet-Setup
   Open: 192.168.4.1
   ```
3. On your phone or laptop, join the open Wi-Fi network **`PocketPet-Setup`**.
4. The setup page will open automatically (or open `http://192.168.4.1`).
5. Select or type your home Wi-Fi network and password, then click **Connect Device**.
6. The ESP32 saves your Wi-Fi credentials to NVS and reboots in station mode.

---

### Step 2: Pair Your Keychain to Your Account
1. Once connected to Wi-Fi, the OLED screen will display a box with a 6-digit code:
   ```
   ┌──────────────────────┐
   │    Pair Your Device  │
   │    ┌────────────┐    │
   │    │   482193   │    │
   │    └────────────┘    │
   └──────────────────────┘
   ```
2. In your browser at `http://localhost:5173`, log in with:
   - Email: `demo@pocketpet.dev`
   - Password: `password123`
3. Click **Pair New Keychain** (or go to `/pair`).
4. Type the 6 digits from the OLED screen and click **Link to My Account**.
5. Within 2 seconds, the screen will flash: **"Paired! Welcome home!"** and start the animated dog!

---

### Step 3: Send Messages & Built-In Icons
1. On the web dashboard, click **Send** on your device card.
2. Type a message (e.g. `I love you :heart: See you soon :paw:`).
3. Use the duration slider to choose how long it displays (e.g. 20s).
4. Click **Send to PocketPet**:
   - The status ticker tracks: `Queued` ➔ `Delivered` ➔ `Displayed on OLED Screen!`
   - The OLED display renders the text and custom icons on the physical device.

---

### Step 4: Draw Live Pixel Art in the Studio
1. Click **Pixel Editor** in the navigation bar.
2. Draw on the 128×64 canvas using the Pencil, Line, Rectangle, Circle, or Flood Fill tools.
3. Or click **Import Image** to load any photo from your computer — the Floyd-Steinberg algorithm will dither it into a high-contrast 1-bit image.
4. Select your device and click **Broadcast Drawing**. The physical screen immediately updates with your artwork!

---

### Step 5: Send a Reaction from the Keychain
1. While any message or drawing is showing on the screen (or within 60 seconds afterwards):
2. **Double-press** the physical button on the keychain.
3. The keychain shows a heart animation and says "Sent!".
4. Look at your web dashboard: under **Pet Reactions & Responses**, a live **❤️ Heart reaction** is logged!

---

### Step 6: Button Gestures Quick Reference

| Gesture | Physical Action | Result |
| :--- | :--- | :--- |
| **Short Press** | 1 quick tap (< 500 ms) | Dismisses custom message and returns to pet animation; cycles modes |
| **Double Press** | 2 quick taps | Sends **❤️ Heart reaction** back to sender's dashboard |
| **Triple Press** | 3 quick taps | Sends **😊 Smile reaction** back to sender's dashboard |
| **Long Press** | Hold for 3 seconds | Re-opens Wi-Fi Captive Portal (`PocketPet-Setup`) to change networks |
| **Very Long Press** | Hold for 10 seconds | Factory reset (wipes saved Wi-Fi and device token) |

---

## 7. Cloud Deployment Guide

When you are ready to take PocketPet anywhere outside your home Wi-Fi:

### 1. Database: MongoDB Atlas
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free **M0** cluster.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere).
4. Under **Database Access**, create a user and copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pocketpet?retryWrites=true&w=majority`

### 2. Backend: Render (Web Service)
1. Push your repository to GitHub.
2. Sign in to [render.com](https://render.com) and create a **New Web Service**.
3. Select your `PocketPet` repo:
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci`
   - **Start Command:** `node src/server.js`
   - **Health Check Path:** `/healthz`
4. Add Environment Variables:
   - `MONGODB_URI`: your Atlas connection string
   - `JWT_SECRET`: your secret string
   - `FRONTEND_ORIGIN`: `https://your-pocketpet.vercel.app`
5. Click **Deploy**. Note your URL (e.g. `https://pocketpet-api.onrender.com/api/v1`).

### 3. Frontend: Vercel
1. Sign in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `PocketPet` repo:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://pocketpet-api.onrender.com/api/v1`
4. Click **Deploy**.

### 4. Update Firmware
Update `API_BASE_URL` in `firmware/include/secrets.h` to your Render URL:
```cpp
#define API_BASE_URL "https://pocketpet-api.onrender.com/api/v1"
```
Re-flash with `pio run -t upload` and your PocketPet will work seamlessly anywhere in the world!

