import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { protect } from "../middleware/auth.middleware.js" // Import the middleware

const router = express.Router()

// ... REGISTER (keep your existing code) ...

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    console.log("REGISTER HIT")
    console.log("BODY:", req.body)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    res.status(201).json({ message: "User registered successfully" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// LOGIN - UPDATED to include score
// LOGIN - Updated with role for UI logic
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send the ROLE so the frontend knows which Dashboard to show
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 👈 CRITICAL for Dashboard UI
        contributionScore: user.contributionScore || 0,
        totalDonations: user.totalDonations || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// NEW: GET CURRENT USER DATA
// This is what the Dashboard calls to show the user's personal score
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET LEADERBOARD (keep your existing code)
router.get("/leaderboard", async (req, res) => {
  try {
    const topDonors = await User.find() // Removed role check temporarily for testing
      .sort({ contributionScore: -1 })
      .limit(5)
      .select("name contributionScore avatar");
    res.status(200).json(topDonors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

export default router