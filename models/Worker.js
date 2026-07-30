const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Worker name is required"],
      trim: true,
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "electrician", "plumber", "salon", "cleaning",
        "webdev", "digitalmkt", "tutors", "carpenter",
        "grocery", "pharmacy", "other",
      ],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    distance: { type: String, default: "" },
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    isOpen: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    experience: { type: String, default: "" },
    workingHours: { type: String, default: "09:00 AM - 06:00 PM" },
    pricePerHour: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    image: { type: String, default: "" },
    banner: { type: String, default: "" },
    about: { type: String, default: "" },
    services: [
      {
        name: { type: String, required: true },
        price: { type: String, required: true },
      },
    ],
    ratingBreakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Text index for search
workerSchema.index({ name: "text", profession: "text", about: "text", category: "text" });

module.exports = mongoose.model("Worker", workerSchema);
