import multer from "multer";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const storage = multer.memoryStorage();

export const menuUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new AppError("Only PDF, JPG, JPEG, and PNG files are allowed", 400));
  },
}).single("menu");

export function handleMenuUpload(req, res, next) {
  menuUpload(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof AppError) {
      next(err);
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Menu file must be 10MB or smaller", 400));
      return;
    }

    next(err);
  });
}
