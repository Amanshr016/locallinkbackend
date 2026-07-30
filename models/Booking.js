const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, default: "" },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: String,
      required: [true, "Service name is required"],
    },
    date: {
      type: String,
      required: [true, "Booking date is required"],
    },
    time: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    amount: {
      type: String,
      default: "₹0",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate booking ID
bookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId = `BK-IN${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
