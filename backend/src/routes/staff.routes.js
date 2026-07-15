import { Router } from "express";
import * as staffController from "../controllers/staff.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("OWNER"));

router.get("/", staffController.getStaffList);
router.post("/", staffController.addStaff);
router.patch("/:staffId/role", staffController.updateStaffRole);
router.patch("/:staffId/deactivate", staffController.deactivateStaff);
router.patch("/:staffId/activate", staffController.activateStaff);

export default router;
