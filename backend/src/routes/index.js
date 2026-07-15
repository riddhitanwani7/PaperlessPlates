import { Router } from "express";
import authRoutes from "./auth.routes.js";
import restaurantRoutes from "./restaurant.routes.js";
import qrRoutes from "./qr.routes.js";
import publicRoutes from "./public.routes.js";
import categoryRoutes from "./category.routes.js";
import menuItemRoutes from "./menuItem.routes.js";
import orderRoutes from "./order.routes.js";
import tableRoutes from "./table.routes.js";
import roomRoutes from "./room.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import staffRoutes from "./staff.routes.js";
import paymentRoutes from "../payments/payment.routes.js";
import adminRoutes from "./admin.routes.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "PaperlessPlates API is running" });
});

router.get("/protected-example", protect, (req, res) => {
  res.json({
    success: true,
    message: "You have access to this protected route",
    user: req.user,
  });
});

router.use("/auth", authRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/qr", qrRoutes);
router.use("/public", publicRoutes);
router.use("/categories", categoryRoutes);
router.use("/menu-items", menuItemRoutes);
router.use("/orders", orderRoutes);
router.use("/tables", tableRoutes);
router.use("/rooms", roomRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/staff", staffRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
