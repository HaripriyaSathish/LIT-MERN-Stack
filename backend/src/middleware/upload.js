import multer from "multer";

// Images are kept in memory, then saved to Cloudinary or /uploads (config/cloudinary.js)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon)$/.test(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error("Only image files (JPG, PNG, WEBP, GIF, SVG, ICO) are allowed."), { status: 400 }));
  },
});
