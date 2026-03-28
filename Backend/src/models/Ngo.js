import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "Active food distribution partner." },
  phone: String,
  email: String,
  capacity: Number,
  
  // 🟢 ADD THIS LINE:
  category: String, 
  
  // This is where the script will move the data to:
  categories: { type: [String], default: [] }, 
  
  verified: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
}, { timestamps: true });

ngoSchema.index({ location: "2dsphere" });

export default mongoose.model("Ngo", ngoSchema)