import express from "express";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ GET ALL NOTIFICATIONS (Fixes the empty page)
router.get("/", protect, async (req, res) => {
  try {
    // For the hackathon, we'll send some mock data so your UI looks great.
    // Later, you can fetch these from a MongoDB "Notification" model.
    const mockNotifications = [
      {
        _id: "1",
        type: "nearby",
        title: "New Food Nearby!",
        message: "Fresh pasta available 2km away from your location.",
        unread: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        type: "achievement",
        title: "Milestone Reached!",
        message: "You've helped save 50kg of food this month!",
        unread: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
    res.json(mockNotifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ✅ GET UNREAD COUNT (For the Navbar)
router.get("/count", protect, async (req, res) => {
  res.json({ count: 1 });
});

export default router;