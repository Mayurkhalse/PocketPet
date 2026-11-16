const mongoose = require("mongoose");

const pairingCodeSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

pairingCodeSchema.index({ code: 1, expiresAt: 1 });

module.exports = mongoose.model("PairingCode", pairingCodeSchema);

