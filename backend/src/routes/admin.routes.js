import express from "express";
import {
  getAllRestaurants,
  updateRestaurantPlan,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware to ensure only SUPER_ADMIN can access these routes
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. SUPER_ADMIN role required.",
    });
  }
  next();
};

router.use(protect);
router.use(superAdminOnly);

router.get("/restaurants", getAllRestaurants);
router.patch("/restaurants/:id/plan", updateRestaurantPlan);

export default router;
