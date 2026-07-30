const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    discount: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    validUntil: { type: String, required: true },
    serviceName: { type: String, required: true },
    price: { type: String, required: true },
    originalPrice: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
