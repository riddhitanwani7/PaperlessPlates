import Razorpay from "razorpay";
import crypto from "crypto";
import { AppError } from "../utils/AppError.js";
import { decrypt } from "../utils/encryption.js";

function getRestaurantKeySecret(settings) {
  if (settings?.provider !== "razorpay" || !settings.keyId || !settings.encryptedKeySecret) {
    throw new AppError("Razorpay is not configured for this restaurant", 400);
  }

  const keySecret = decrypt(settings.encryptedKeySecret);
  if (!keySecret) {
    throw new AppError("Razorpay secret key is not configured for this restaurant", 400);
  }

  return keySecret;
}

export function getRazorpayClient(settings) {
  const keySecret = getRestaurantKeySecret(settings);
  return new Razorpay({
    key_id: settings.keyId,
    key_secret: keySecret,
  });
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
    if (error instanceof AppError) {
      throw error;
    }

    console.error("========== RAZORPAY ERROR ==========");
    console.error(error);
    console.error(error.error);
    console.error(error.message);
    console.error("====================================");

    throw new AppError(error.message || "Failed to create Razorpay order", 500);
  }
}

export function verifyPaymentSignature(orderId, paymentId, signature, settings) {
  const keySecret = getRestaurantKeySecret(settings);

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

export function verifyWebhookSignature(body, signature, settings) {
  if (settings?.provider !== "razorpay" || !settings.encryptedWebhookSecret) {
    throw new AppError("Razorpay webhook secret is not configured for this restaurant", 400);
  }

  const webhookSecret = decrypt(settings.encryptedWebhookSecret);

  if (!webhookSecret) {
    throw new AppError("Razorpay webhook secret is not configured for this restaurant", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
