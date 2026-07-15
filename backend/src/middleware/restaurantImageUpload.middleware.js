import multer from "multer";
import { AppError } from "../utils/AppError.js";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const storage = multer.memoryStorage();

function createImageUpload(fieldName) {
  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
      if (IMAGE_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
        return;
      }
      cb(new AppError("Only JPG, JPEG, PNG, and WEBP images are allowed", 400));
    },
  }).single(fieldName);
}

const logoUpload = createImageUpload("logo");
const coverUpload = createImageUpload("cover");

function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (!err) {
        next();
        return;
      }

      if (err instanceof AppError) {
        next(err);
        return;
      }

      if (err.code === "LIMIT_FILE_SIZE") {
        next(new AppError("Image must be 5MB or smaller", 400));
        return;
      }

      next(err);
    });
  };
}

export const handleLogoUpload = handleUpload(logoUpload);
export const handleCoverUpload = handleUpload(coverUpload);
