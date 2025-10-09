import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sharefy_project_media", // same folder for images & videos
    resource_type: "auto",          // automatically detects image or video
    allowedFormats: ["png", "jpeg", "jpg", "mp4", "mov", "avi"],
  },
});

export { cloudinary, storage };
