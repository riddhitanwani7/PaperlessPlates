import * as paymentService from "./payment.service.js";
import * as orderService from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Restaurant } from "../models/Restaurant.js";
import { RazorpayOrderMapping } from "../models/RazorpayOrderMapping.js";
import { Order } from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import { hasFeature } from "../services/subscription.helper.js";

export const createPaymentOrder = asyncHandler(async (req, res) => {
  console.log("========== CREATE PAYMENT ORDER ==========");
  console.log(req.body);

  const { amount, currency, receipt, restaurantId } = req.body;

  if (!amount || !receipt) {
    return res.status(400).json({
      success: false,
      message: "Amount and receipt are required",
    });
  }

  let restaurant = null;
  if (restaurantId) {
    restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Check if the restaurant configured their settings but disabled payments
    if (restaurant.paymentSettings?.provider && !restaurant.paymentSettings.paymentsEnabled) {
      return res.status(400).json({
        success: false,
        message: "Online payments are disabled for this restaurant",
      });
    }

    // Check if the restaurant's plan includes online payments at all
    if (!hasFeature(restaurant, "onlinePayments")) {
      return res.status(400).json({
        success: false,
        message: "Online payment is unavailable for this restaurant. Please pay at the counter.",
      });
    }
  }

  const settings = restaurant?.paymentSettings;

  const order = await paymentService.createRazorpayOrder(
    amount,
    currency || "INR",
    receipt,
    settings
  );

  const keyId = settings?.keyId || process.env.RAZORPAY_KEY_ID;

  if (restaurantId) {
    await RazorpayOrderMapping.create({
      razorpayOrderId: order.id,
      restaurantId: restaurantId,
      amount: order.amount,
      currency: order.currency,
      receipt: receipt,
    });
  }

  res.json({
    success: true,
    data: {
      key: keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    paymentId,
    signature,
    orderData,
  } = req.body;

  if (
    !orderId ||
    !paymentId ||
    !signature ||
    !orderData
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing payment data",
    });
  }

  const restaurantId = orderData.restaurantId;
  let restaurant = null;
  if (restaurantId) {
    restaurant = await Restaurant.findById(restaurantId);
  }

  const settings = restaurant?.paymentSettings;

  const valid = paymentService.verifyPaymentSignature(
    orderId,
    paymentId,
    signature,
    settings
  );

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  // Update status in mapping
  if (orderId) {
    await RazorpayOrderMapping.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status: "paid" }
    ).catch(err => console.error("Mapping status update failed:", err));
  }

  const order = await orderService.createOrder({
    ...orderData,
    paymentMethod: "UPI",
    paymentGateway: "RAZORPAY",
    paymentStatus: "PAID",
    paymentId,
    paymentGatewayOrderId: orderId,
    paymentSignature: signature,
  });

  res.json({
    success: true,
    data: { order },
  });
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: "Missing signature",
    });
  }

  const payload = req.body;
  const orderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;

  let restaurant = null;
  if (orderId) {
    const mapping = await RazorpayOrderMapping.findOne({ razorpayOrderId: orderId });
    if (mapping) {
      restaurant = await Restaurant.findById(mapping.restaurantId);
    } else {
      const existingOrder = await Order.findOne({ paymentGatewayOrderId: orderId });
      if (existingOrder) {
        restaurant = await Restaurant.findById(existingOrder.restaurantId);
      }
    }
  }

  const settings = restaurant?.paymentSettings;

  const valid = paymentService.verifyWebhookSignature(
    JSON.stringify(payload),
    signature,
    settings
  );

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  console.log("Webhook verified successfully for restaurant:", restaurant?.restaurantName || "Global/Fallback");
  console.log("Event:", payload.event);

  res.json({
    success: true,
  });
});
