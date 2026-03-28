import mongoose from "mongoose";
import dotenv from "dotenv";
import Ngo from "../models/Ngo.js"; // Ensure path is correct

dotenv.config();

const fixCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Cleanup...");

    // Force find all NGOs that have the old singular category string
    const ngosToUpdate = await Ngo.find({ category: { $exists: true } });

    console.log(`Checking ${ngosToUpdate.length} NGOs for migration...`);

    for (const ngo of ngosToUpdate) {
      // Use ngo.get('category') if Mongoose is being stubborn with the schema
      const categoryValue = ngo.category || ngo.get('category'); 

      if (categoryValue) {
        ngo.categories = [categoryValue]; 
        // Tell Mongoose the array was modified
        ngo.markModified('categories'); 
        
        await ngo.save();
        console.log(`✅ Updated: ${ngo.name} -> [${categoryValue}]`);
      }
    }

    console.log("Cleanup Complete!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup Error:", err);
    process.exit(1);
  }
};

fixCategories();