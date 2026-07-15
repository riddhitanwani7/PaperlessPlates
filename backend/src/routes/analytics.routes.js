import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", protect, authorize("OWNER", "MANAGER"), analyticsController.getAnalytics);

export default router;
