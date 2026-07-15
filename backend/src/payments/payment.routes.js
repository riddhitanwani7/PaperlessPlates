import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} from "./payment.controller.js";

const router = Router();

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
