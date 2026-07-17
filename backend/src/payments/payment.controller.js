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

  const { currency, receipt, restaurantId, qrCodeId, items } = req.body;

  if (!receipt) {
    return res.status(400).json({
      success: false,
      message: "Payment receipt is required",
    });
  }

  const quote = await orderService.getOrderQuote({ items, qrCodeId, restaurantId });
  const { restaurant } = quote.context;

  const existingPayment = await RazorpayOrderMapping.findOne({
    restaurantId: restaurant._id,
    receipt,
  });
  if (existingPayment) {
    if (!existingPayment.qrCodeId || existingPayment.qrCodeId.toString() !== quote.context.qr._id.toString()) {
      throw new AppError("Invalid or expired ordering link. Please scan the QR code again.", 400);
    }
    if (existingPayment.status === "paid") {
      throw new AppError("Payment has already been processed", 409);
    }
    return res.json({
      success: true,
      data: {
        key: restaurant.paymentSettings?.keyId,
        orderId: existingPayment.razorpayOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
      },
    });
  }

  if (!restaurant.paymentSettings?.paymentsEnabled) {
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

  const settings = restaurant.paymentSettings;

  const order = await paymentService.createRazorpayOrder(
    quote.total,
    currency || "INR",
    receipt,
    settings
  );

  const keyId = settings.keyId;

  await RazorpayOrderMapping.create({
    razorpayOrderId: order.id,
    restaurantId: restaurant._id,
    qrCodeId: quote.context.qr._id,
    orderType: quote.context.orderType,
    tableId: quote.context.tableId,
    roomId: quote.context.roomId,
    amount: order.amount,
    currency: order.currency,
    receipt: receipt,
  });

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

  const mapping = await RazorpayOrderMapping.findOne({ razorpayOrderId: orderId });
  if (!mapping) {
    return res.status(404).json({
      success: false,
      message: "Payment order not found",
    });
  }

  const restaurant = await Restaurant.findById(mapping.restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  const settings = restaurant.paymentSettings;
  if (!mapping.qrCodeId || !mapping.orderType) {
    throw new AppError("Payment ordering context is unavailable", 400);
  }

  const paymentContext = {
    restaurant,
    qr: { _id: mapping.qrCodeId },
    orderType: mapping.orderType,
    tableId: mapping.tableId,
    roomId: mapping.roomId,
  };
  const quote = await orderService.getOrderQuoteForPaymentMapping({
    items: orderData.items,
    context: paymentContext,
  });
  if (mapping.amount !== Math.round(quote.total * 100)) {
    throw new AppError("Payment amount no longer matches the order", 400);
  }

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

  // Atomically consume the Razorpay order so a replay cannot create another order.
  const consumedPayment = await RazorpayOrderMapping.findOneAndUpdate(
    { _id: mapping._id, status: "created" },
    { status: "paid" },
    { new: true },
  );
  if (!consumedPayment) {
    throw new AppError("Payment has already been processed", 409);
  }

  const order = await orderService.createPaidOrderFromPaymentMapping({
    ...orderData,
    restaurantId: mapping.restaurantId,
    qrCodeId: mapping.qrCodeId,
    orderType: mapping.orderType,
    tableId: mapping.tableId,
    roomId: mapping.roomId,
    paymentMethod: "UPI",
    paymentGateway: "RAZORPAY",
    paymentStatus: "PAID",
    paymentId,
    paymentGatewayOrderId: orderId,
    paymentSignature: signature,
  }, paymentContext);

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

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Webhook does not reference a Razorpay order",
    });
  }

  const mapping = await RazorpayOrderMapping.findOne({ razorpayOrderId: orderId });
  const restaurantId = mapping?.restaurantId || (await Order.findOne({ paymentGatewayOrderId: orderId }))?.restaurantId;
  if (!restaurantId) {
    return res.status(404).json({
      success: false,
      message: "Restaurant payment order not found",
    });
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  const settings = restaurant.paymentSettings;

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

  console.log("Webhook verified successfully for restaurant:", restaurant.restaurantName);
  console.log("Event:", payload.event);

  res.json({
    success: true,
  });
});
