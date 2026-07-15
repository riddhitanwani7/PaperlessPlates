import Razorpay from "razorpay";
import crypto from "crypto";
import { SubscriptionPayment } from "../models/SubscriptionPayment.js";
import { Restaurant } from "../models/Restaurant.js";
import { getPlanById } from "../config/plans.js";
import { AppError } from "../utils/AppError.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createSubscriptionOrder = async (
  restaurantId,
  ownerId,
  planId
) => {
  const plan = getPlanById(planId);

  if (!plan || plan.priceInr === null || plan.priceInr <= 0) {
    throw new AppError("Invalid plan selected", 400);
  }

  const orderOptions = {
    amount: plan.priceInr * 100, // Convert to paise
    currency: "INR",
    receipt: `sub_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(orderOptions);

  // Create subscription payment record
  const subscriptionPayment = await SubscriptionPayment.create({
    restaurantId,
    ownerId,
    plan: planId,
    amount: plan.priceInr,
    currency: "INR",
    paymentGatewayOrderId: razorpayOrder.id,
    status: "CREATED",
  });

  return {
    razorpayOrder,
    subscriptionPaymentId: subscriptionPayment._id,
    plan,
  };
};

export const verifySubscriptionPayment = async (
  orderId,
  paymentId,
  signature,
  ownerId
) => {
  // Find the subscription payment record
  const subscriptionPayment = await SubscriptionPayment.findOne({
    paymentGatewayOrderId: orderId,
  });

  if (!subscriptionPayment) {
    throw new AppError("Payment not found", 404);
  }

  // Verify signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature !== signature) {
    subscriptionPayment.status = "FAILED";
    await subscriptionPayment.save();
    throw new AppError("Invalid payment signature", 400);
  }

  // Update subscription payment
  subscriptionPayment.paymentId = paymentId;
  subscriptionPayment.paymentSignature = signature;
  subscriptionPayment.status = "PAID";
  subscriptionPayment.paidAt = new Date();
  await subscriptionPayment.save();

  // Update restaurant subscription
  const restaurant = await Restaurant.findById(subscriptionPayment.restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  const plan = getPlanById(subscriptionPayment.plan);

  // Calculate expiry date
  let newExpiryDate;
  if (
    restaurant.subscriptionStatus === "ACTIVE" &&
    restaurant.subscriptionExpiry &&
    new Date(restaurant.subscriptionExpiry) > new Date()
  ) {
    // Extend existing subscription
    newExpiryDate = new Date(restaurant.subscriptionExpiry);
    newExpiryDate.setDate(newExpiryDate.getDate() + (plan.durationDays || 30));
  } else {
    // New subscription
    newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + (plan.durationDays || 30));
  }

  restaurant.selectedPlan = subscriptionPayment.plan;
  restaurant.pendingPlan = undefined;
  restaurant.subscriptionStatus = "ACTIVE";
  restaurant.subscriptionExpiry = newExpiryDate;
  restaurant.lastSubscriptionPaymentId = subscriptionPayment._id;

  await restaurant.save();

  return { subscriptionPayment, restaurant };
};

export const getSubscriptionHistory = async (restaurantId) => {
  return await SubscriptionPayment.find({ restaurantId }).sort({
    createdAt: -1,
  });
};

export const getCurrentSubscription = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  const lastPayment = await SubscriptionPayment.findById(
    restaurant.lastSubscriptionPaymentId
  );

  return {
    selectedPlan: restaurant.selectedPlan || "Basic",
    pendingPlan: restaurant.pendingPlan,
    subscriptionStatus: restaurant.subscriptionStatus || "TRIAL",
    subscriptionExpiry: restaurant.subscriptionExpiry,
    lastPayment,
  };
};
