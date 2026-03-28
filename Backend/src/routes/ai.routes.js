import express from "express"
import Ngo from "../models/Ngo.js"
import { matchBestNgo } from "../utils/matchNgo.js"

const router = express.Router()

router.post("/match", async (req, res) => {
  try {
    const food = req.body;

    // 🟢 Safety Check 1: Ensure food data exists
    if (!food || Object.keys(food).length === 0) {
       return res.status(400).json({ message: "No food data provided for matching" });
    }

    const ngos = await Ngo.find({ verified: true });

    // 🟢 Safety Check 2: Handle case where no NGOs exist
    if (!ngos || ngos.length === 0) {
      return res.json({ bestNgo: null, message: "No verified NGOs found" });
    }

    // 🟢 Safety Check 3: Log to ensure function is actually a function
    if (typeof matchBestNgo !== 'function') {
        console.error("CRITICAL: matchBestNgo is not a function. Check your imports!");
        return res.status(500).json({ message: "Matching utility is undefined" });
    }

    const bestNgo = matchBestNgo(food, ngos);

    res.json({ bestNgo });
    
  } catch (err) {
    console.error("AI Match Error Stack:", err.stack); // 🟢 This will show the exact line number
    res.status(500).json({ message: "AI match failed", error: err.message });
  }
});

export default router