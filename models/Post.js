const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    city: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Looking For", "For Sale", "Lost & Found", "Local Alert", "General"],
      default: "General",
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
