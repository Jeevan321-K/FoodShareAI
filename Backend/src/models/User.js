import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  bio: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, enum: ["donor", "ngo"], default: "donor" },
  contributionScore: { type: Number, default: 0 },
  totalDonations: { type: Number, default: 0 }, // Track how many times they've helped
  avatar: { type: String, default: "" } // Store initials or a URL
}, { timestamps: true })

export default mongoose.models.User || mongoose.model("User", userSchema)