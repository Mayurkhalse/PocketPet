const mongoose = require("mongoose");

const playlistItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "bitmap"],
      required: true,
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
    durationSec: {
      type: Number,
      required: true,
      min: 1,
      max: 600,
      default: 5,
    },
  },
  { _id: false }
);

const playlistSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    repeat: {
      type: Boolean,
      default: false,
    },
    items: {
      type: [playlistItemSchema],
      validate: [
        (val) => val.length <= 20,
        "Playlist can contain a maximum of 20 items",
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Playlist", playlistSchema);

