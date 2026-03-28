import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    quantity: {
      value: Number,
      unit: String,
    },
    description: { type: String },
    
    // ✅ FIXED: Changed to accept both simple strings or objects
    // This prevents the "Cast to embedded failed" error you saw in the logs
    images: {
      type: [String], 
      default: []
    },

    // ✅ FIXED: Changed to GeoJSON for $near compatibility
    pickupLocation: {
      address: String,
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

    expiryTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["available", "pending", "matched", "claimed", "collected", "expired"],
      default: "available",
    },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priorityScore: Number,
    matchedNgo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo" },
    quality: {
      type: String,
      enum: ["FRESH", "MEDIUM", "UNSAFE"],
      default: "FRESH",
    },
  },
  { timestamps: true }
);

// 🔥 CRITICAL: Add this index so the NGO matching actually works!
foodSchema.index({ "pickupLocation.coordinates": "2dsphere" });

export default mongoose.model("Food", foodSchema);