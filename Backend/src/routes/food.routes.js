import express from "express";
import Food from "../models/Food.js";
import Ngo from "../models/Ngo.js";
import { protect } from "../middleware/auth.middleware.js";
import { findBestNGO } from "../services/matching.service.js"; // 🟢 Ensure this matches your service file
import { createUploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

// 🔹 NLP urgency analyzer
function analyzeUrgencyNLP(description) {
  if (!description) return 0;
  const text = description.toLowerCase();
  const urgentKeywords = ["urgent", "hurry", "fast", "spoil", "emergency", "soon", "tonight", "perishable"];
  let scoreBoost = 0;
  urgentKeywords.forEach((word) => {
    if (text.includes(word)) scoreBoost += 20;
  });
  return Math.min(scoreBoost, 50);
}

// ✅ GET ALL FOOD
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find()
      .populate("matchedNgo","name")
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    console.error("GET FOOD ERROR:", err);
    res.status(500).json({ message: "Error fetching food listings" });
  }
});

// ✅ ADD FOOD
router.post("/add", protect, createUploadMiddleware().array("images", 4), async (req, res, next) => {
  try {
    console.log("🚩 STEP 1: Entering Food Add Route");
    
    // 1. Extract and Parse Data
    const { title, description, category, quantityValue, quantityUnit, expiryTime, lat, lng } = req.body;
    
    // 2. Handle Images from Cloudinary
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    // 3. Create the food instance
    const food = new Food({
      title,
      description,
      category,
      quantity: {
        value: Number(quantityValue),
        unit: quantityUnit
      },
      expiryTime: new Date(expiryTime),
      images: imageUrls,
      donor: req.user._id,
      pickupLocation: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
      }
    });

    console.log(`🚩 STEP 2: Logic Check - Category: ${food.category}, Coords: ${food.pickupLocation.coordinates}`);

    // 4. Query NGOs (Using Geospatial near query)
    const availableNgos = await Ngo.find({
      verified: true,
      location: {
        $near: {
          $geometry: { 
            type: "Point", 
            coordinates: [parseFloat(lng), parseFloat(lat)] 
          },
          $maxDistance: 50000 // 50km
        }
      }
    });

    console.log(`🚩 STEP 3: Found ${availableNgos.length} verified NGOs within 50km`);

    // 5. Run AI Matching
    if (availableNgos.length > 0) {
      const nlpBoost = analyzeUrgencyNLP(description);
      console.log(`🚩 STEP 4: Running findBestNGO with NLP Boost: ${nlpBoost}`);

      // 🟢 FIX: Changed matchBestNgo to findBestNGO to match your import
      const result = await findBestNGO(food, availableNgos, nlpBoost);
      
      if (result && result.bestNgo) {
        console.log("✅ MATCH SUCCESS:", result.bestNgo.name);
        food.matchedNgo = result.bestNgo._id;
        food.status = "matched";
      } else {
        console.log("⚠️ AI Matcher could not find a suitable candidate (Score too low or category mismatch)");
      }
    } else {
      console.log("⚠️ No NGOs found in this geographic area.");
    }

    // 6. Final Save
    await food.save();
    console.log("🚩 STEP 5: Food Document Saved with Status:", food.status);
    
    res.status(201).json({ success: true, food });

  } catch (err) {
    console.error("❌ ROUTE FATAL ERROR:", err.stack);
    next(err); 
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