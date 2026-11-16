const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["REACTION"],
      required: true,
    },
    reaction: {
      type: String,
      enum: ["heart", "smile"],
      required: true,
    },
    refSeq: {
      type: Number,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ toUserId: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);

