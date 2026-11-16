const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    seq: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["SHOW_CONTENT", "PLAY_PLAYLIST", "STOP", "SET_SETTINGS", "UNPAIR", "REBOOT"],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "acked", "failed", "expired"],
      default: "pending",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    ackedAt: {
      type: Date,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commandSchema.index({ deviceId: 1, seq: 1 }, { unique: true });
commandSchema.index({ deviceId: 1, status: 1, seq: 1 });

module.exports = mongoose.model("Command", commandSchema);

