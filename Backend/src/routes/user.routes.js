import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ GET USER SETTINGS (Fixes the 404)
router.get("/settings", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("theme notifications");
    res.json({
      theme: user.theme || "dark",
      notifications: user.notifications || {
        email: true,
        push: true,
        foodNearby: true,
        expiring: true,
        claimed: true,
        achievements: false,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching settings" });
  }
});

// ✅ UPDATE SETTINGS (PATCH)
router.patch("/settings", protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// ✅ GET USER'S SCHEDULED PICKUPS
router.get("/my-schedules", protect, async (req, res) => {
  try {
    const schedules = await Food.find({ donor: req.user._id, status: "matched" })
      .populate("matchedNgo");
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schedules" });
  }
});

export default router;