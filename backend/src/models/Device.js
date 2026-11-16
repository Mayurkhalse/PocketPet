const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    hardwareId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: "My PocketPet",
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        role: {
          type: String,
          enum: ["sender"],
          default: "sender",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    nextSeq: {
      type: Number,
      default: 1,
    },
    status: {
      lastSeenAt: { type: Date, default: null },
      rssi: { type: Number, default: null },
      battery: { type: Number, default: null },
      fwVersion: { type: String, default: "1.0.0" },
      currentMode: {
        type: String,
        enum: ["pet", "content", "playlist", "unknown"],
        default: "unknown",
      },
      lastAckedSeq: { type: Number, default: 0 },
    },
    settings: {
      pollIntervalSec: { type: Number, default: 8, min: 5, max: 60 },
      brightness: { type: Number, default: 255, min: 0, max: 255 },
      petSkin: { type: String, default: "default" },
      timezone: { type: String, default: "UTC" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Derived virtual: online = now - lastSeenAt < 2.5 * pollIntervalSec
deviceSchema.virtual("online").get(function () {
  if (!this.status || !this.status.lastSeenAt) return false;
  const pollSec = this.settings?.pollIntervalSec || 8;
  const timeoutMs = 2.5 * pollSec * 1000;
  return Date.now() - new Date(this.status.lastSeenAt).getTime() < timeoutMs;
});

module.exports = mongoose.model("Device", deviceSchema);

