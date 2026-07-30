const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, default: "" },
    avatar: { type: String, default: "" },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    date: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from same user for same worker
reviewSchema.index({ worker: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
