import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { getCloudinary } from "../config/cloudinary.js"

const cloudinary = getCloudinary()

export const createUploadMiddleware = () => {
 // Look for the cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "food_donations",
    // 🟢 ADD 'webp' TO THIS ARRAY
    allowed_formats: ["jpg", "jpeg", "png", "webp"], 
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

  return multer({ storage })
}