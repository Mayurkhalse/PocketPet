#!/usr/bin/env node

/**
 * PocketPet Device Simulator
 * Emulates the ESP32-C3 hardware over HTTP/JSON
 */

const API_BASE = process.env.API_URL || "http://localhost:8080/api/v1";
const HARDWARE_ID = process.env.HARDWARE_ID || `pp-SIM-${Math.floor(1000 + Math.random() * 9000)}`;

let deviceToken = null;
let lastSeq = 0;
let pollTimer = null;
let currentCommand = null;

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (deviceToken) {
    headers["Authorization"] = `Bearer ${deviceToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`API Error [${res.status}]: ${data?.error?.message || res.statusText}`);
  }
  return data;
}

function printAsciiScreen(lines) {
  console.log("\n  ┌────────────────────────────────────────┐");
  lines.forEach((line) => {
    const pad = Math.max(0, 38 - line.length);
    console.log(`  │ ${line}${" ".repeat(pad)} │`);
  });
  console.log("  └────────────────────────────────────────┘\n");
}

async function register() {
  console.log(`\n🐾 Starting PocketPet Simulator [ID: ${HARDWARE_ID}]`);
  console.log(`🌐 Target API: ${API_BASE}`);

  try {
    const data = await request("/device/register", {
      method: "POST",
      body: JSON.stringify({
        hardwareId: HARDWARE_ID,
        fwVersion: "1.0.0-sim",
      }),
    });

    deviceToken = data.deviceToken;
    console.log("✅ Device registered with server!");
    printAsciiScreen([
      "🐶 POCKETPET (SIM)",
      "",
      `Pairing Code: [ ${data.pairingCode} ]`,
      "Enter code on web dashboard to pair",
    ]);

    startPolling(data.pollIntervalSec || 5);
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    setTimeout(register, 5000);
  }
}

async function sendReaction(reactionType) {
  if (!currentCommand) {
    console.log("⚠️ No active or recent content command to react to.");
    return;
  }
  try {
    await request("/device/event", {
      method: "POST",
      body: JSON.stringify({
        type: "REACTION",
        reaction: reactionType,
        refSeq: currentCommand.seq,
      }),
    });
    console.log(`💖 Sent reaction '${reactionType}' for command #${currentCommand.seq}!`);
  } catch (err) {
    console.error("❌ Reaction error:", err.message);
  }
}

async function poll() {
  try {
    const query = new URLSearchParams({
      lastSeq: lastSeq.toString(),
      fw: "1.0.0-sim",
      rssi: "-55",
      bat: "92",
      mode: currentCommand ? "content" : "pet",
    });

    const data = await request(`/device/poll?${query}`);

    if (!data.paired) {
      if (data.pairingCode) {
        process.stdout.write(`⏳ Awaiting pairing... Code: ${data.pairingCode}\r`);
      }
      return;
    }

    if (data.commands && data.commands.length > 0) {
      for (const cmd of data.commands) {
        if (cmd.seq <= lastSeq) continue;
        lastSeq = cmd.seq;
        await handleCommand(cmd);
      }
    }
  } catch (err) {
    console.error("\n❌ Poll error:", err.message);
  }
}

async function handleCommand(cmd) {
  console.log(`\n📥 Received command #${cmd.seq} (${cmd.type})`);

  if (cmd.type === "SHOW_CONTENT") {
    currentCommand = cmd;
    const { kind, text, fromName, durationSec } = cmd.payload;
    if (kind === "text") {
      printAsciiScreen([
        fromName ? `From: ${fromName}` : "New Message:",
        "",
        `"${text}"`,
        "",
        `Showing for ${durationSec}s`,
      ]);
    } else {
      printAsciiScreen([
        fromName ? `From: ${fromName}` : "New Drawing:",
        "[ 128x64 Bitmap Image ]",
        `Showing for ${durationSec}s`,
      ]);
    }

    // Acknowledge receipt
    await ackCommand(cmd.seq, "ok");

    // Return to pet mode after duration
    setTimeout(() => {
      if (currentCommand?.seq === cmd.seq) {
        currentCommand = null;
        console.log("🐕 Returning to Pet mode");
      }
    }, (durationSec || 5) * 1000);
  } else if (cmd.type === "PLAY_PLAYLIST") {
    console.log(`🎶 Playing playlist: ${cmd.payload.items?.length || 0} items`);
    await ackCommand(cmd.seq, "ok");
  } else if (cmd.type === "STOP") {
    console.log("⏹️ Stop received: returning to Pet mode");
    currentCommand = null;
    await ackCommand(cmd.seq, "ok");
  } else if (cmd.type === "SET_SETTINGS") {
    console.log("⚙️ Settings updated:", cmd.payload);
    await ackCommand(cmd.seq, "ok");
  } else if (cmd.type === "UNPAIR") {
    console.log("🔓 Unpair received! Resetting device token...");
    deviceToken = null;
    lastSeq = 0;
    currentCommand = null;
    await ackCommand(cmd.seq, "ok");
    setTimeout(register, 2000);
  }
}

async function ackCommand(seq, status, error) {
  try {
    await request("/device/ack", {
      method: "POST",
      body: JSON.stringify({
        acks: [{ seq, status, error }],
      }),
    });
    console.log(`✔️ Ack sent for #${seq}`);
  } catch (err) {
    console.error(`❌ Failed to send ack for #${seq}:`, err.message);
  }
}

function startPolling(intervalSec) {
  if (pollTimer) clearInterval(pollTimer);
  poll();
  pollTimer = setInterval(poll, intervalSec * 1000);
}

// Interactive keyboard controls for simulating gestures
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  console.log("⌨️  Simulator Controls: [h] Send Heart reaction | [s] Send Smile reaction | [q] Quit");

  process.stdin.on("data", async (key) => {
    if (key === "\u0003" || key === "q") {
      console.log("\nExiting simulator...");
      process.exit();
    }
    if (key === "h") {
      await sendReaction("heart");
    }
    if (key === "s") {
      await sendReaction("smile");
    }
  });
}

register();

