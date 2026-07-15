import Razorpay from "razorpay";
import crypto from "crypto";
import { AppError } from "../utils/AppError.js";
import { decrypt } from "../utils/encryption.js";

console.log("Global Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "Loaded" : "Missing");
console.log("Global Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Missing");
console.log("Global Razorpay Webhook Secret:", process.env.RAZORPAY_WEBHOOK_SECRET ? "Loaded" : "Missing");

export function getRazorpayClient(settings) {
  if (settings?.provider === "razorpay" && settings.keyId && settings.encryptedKeySecret) {
    const keySecret = decrypt(settings.encryptedKeySecret);
    if (keySecret) {
      return new Razorpay({
        key_id: settings.keyId,
        key_secret: keySecret,
      });
    }
  }

  // Fallback to global env credentials
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  throw new AppError("Razorpay credentials not configured", 400);
}

export async function createRazorpayOrder(amount, currency = "INR", receipt, settings) {
  try {
    receipt = receipt.substring(0, 40);

    const options = {
      amount: Math.round(Number(amount) * 100), // convert ₹ to paise
      currency,
      receipt,
    };

    console.log("Creating Razorpay Order:", options);

    const client = getRazorpayClient(settings);
    const order = await client.orders.create(options);

    console.log("Razorpay Order Created:", order);

    return order;
  } catch (error) {
    console.error("========== RAZORPAY ERROR ==========");
    console.error(error);
    console.error(error.error);
    console.error(error.message);
    console.error("====================================");

    throw new AppError(error.message || "Failed to create Razorpay order", 500);
  }
}

export function verifyPaymentSignature(orderId, paymentId, signature, settings) {
  let keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (settings?.provider === "razorpay" && settings.encryptedKeySecret) {
    const decrypted = decrypt(settings.encryptedKeySecret);
    if (decrypted) keySecret = decrypted;
  }

  if (!keySecret) {
    throw new AppError("Razorpay secret key not found for verification", 400);
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

export function verifyWebhookSignature(body, signature, settings) {
  let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (settings?.provider === "razorpay" && settings.encryptedWebhookSecret) {
    const decrypted = decrypt(settings.encryptedWebhookSecret);
    if (decrypted) webhookSecret = decrypted;
  }

  if (!webhookSecret) {
    throw new AppError("Razorpay webhook secret not found for verification", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}