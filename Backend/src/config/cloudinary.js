import { v2 as cloudinary } from "cloudinary"

let isConfigured = false

export function getCloudinary() {
  if (!isConfigured) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error("❌ Cloudinary ENV not loaded yet")
    }
    console.log("Cloud ENV:", process.env.CLOUDINARY_CLOUD_NAME)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    isConfigured = true
  }

  return cloudinary
}