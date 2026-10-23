import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Save an uploaded image (multer memory storage) and return its public URL.
 * Cloudinary folder lit/<folder> when configured, otherwise backend/uploads.
 */
export async function saveImage(file, folder = "misc") {
  if (cloudinaryEnabled) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: `lit/${folder}` }, (err, result) =>
        err ? reject(err) : resolve(result.secure_url)
      );
      stream.end(file.buffer);
    });
  }

  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  fs.mkdirSync("uploads", { recursive: true });
  fs.writeFileSync(path.join("uploads", filename), file.buffer);
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${base}/uploads/${filename}`;
}
