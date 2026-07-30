const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    icon: { type: String, default: "FiZap" },
    distance: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    price: { type: String, default: "" },
    description: { type: String, default: "" },
    phone: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    tag: { type: String, default: "" },
    features: [{ type: String }],
    providerName: { type: String, default: "" },
    providerEmail: { type: String, default: "" },
    providerAvatar: { type: String, default: "" },
    providerId: { type: String, default: "" },
    name: { type: String, default: "" },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Service", serviceSchema);
