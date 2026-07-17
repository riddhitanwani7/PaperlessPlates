import { Router } from "express";
import {
  createOrder,
  getCustomerOrders,
  getCustomerOrderConfirmation,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getCustomerOrdersByContext,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createOrder);
router.get("/customer/:customerSessionId", getCustomerOrders);
router.get("/customer/:customerSessionId/confirmation/:orderId", getCustomerOrderConfirmation);
router.get("/customer/:customerSessionId/context", getCustomerOrdersByContext);

router.get(
  "/restaurant/:restaurantId",
  protect,
  authorize("OWNER", "MANAGER", "KITCHEN", "WAITER"),
  getRestaurantOrders,
);
router.get("/:id", protect, authorize("OWNER", "MANAGER", "KITCHEN", "WAITER"), getOrderById);
router.patch(
  "/:id/status",
  protect,
  authorize("OWNER", "MANAGER", "KITCHEN", "WAITER"),
  updateOrderStatus,
);
router.patch(
  "/:id/payment",
  protect,
  authorize("OWNER", "MANAGER", "WAITER"),
  updateOrderPaymentStatus,
);

export default router;
