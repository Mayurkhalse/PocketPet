const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["text", "bitmap"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    text: {
      type: String,
      maxlength: 64,
      default: null,
    },
    bitmapB64: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);

