const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    text: {
      type: String,
      default: "",
    },
    msgType: {
      type: String,
      enum: ["text", "image", "location", "priceQuote", "audio"],
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    location: {
      latitude: Number,
      longitude: Number,
      addressName: String,
    },
    priceQuote: {
      serviceTitle: String,
      amount: String,
      description: String,
      status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
      },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient chat queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
