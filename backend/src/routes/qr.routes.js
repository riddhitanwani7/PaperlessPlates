import { Router } from "express";
import * as qrController from "../controllers/qr.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("OWNER", "MANAGER"));

router.post("/generate", qrController.generateQR);
router.get("/", qrController.getMyQR);
router.get("/:id", qrController.getQRById);
router.patch("/:id", qrController.updateQR);
router.delete("/:id", qrController.deleteQR);

export default router;
