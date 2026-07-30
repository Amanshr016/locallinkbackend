const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phone: { type: String, required: [true, "Phone is required"] },
    city: { type: String, default: "Bengaluru" },
    service: { type: String, default: "General Query" },
    message: { type: String, required: [true, "Message is required"] },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
