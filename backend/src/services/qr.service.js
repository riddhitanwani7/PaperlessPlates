import QRCode from "qrcode";
import { QRCode as QRCodeModel } from "../models/QRCode.js";
import { Restaurant } from "../models/Restaurant.js";
import { Table } from "../models/Table.js";
import { Room } from "../models/Room.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { deleteQrImage, uploadQrImage } from "./upload.service.js";

function sanitizeQR(qr, restaurantName) {
  const label = qr.type === "Restaurant" 
    ? restaurantName || "Main Menu"
    : qr.type === "Table"
    ? `Table ${qr.tableId || ""}`
    : qr.type === "Room"
    ? `Room ${qr.roomId || ""}`
    : "Takeaway";

  return {
    id: qr._id,
    restaurantId: qr.restaurantId,
    slug: qr.slug,
    label,
    type: qr.type,
    url: qr.qrUrl,
    qrUrl: qr.qrUrl,
    qrImageUrl: qr.qrImageUrl,
    active: qr.active,
    scans: qr.scans,
    lastScannedAt: qr.lastScannedAt,
    tableId: qr.tableId,
    roomId: qr.roomId,
    createdAt: qr.createdAt,
    updatedAt: qr.updatedAt,
  };
}

async function getOwnedRestaurant(ownerId) {
  const restaurant = await Restaurant.findOne({ ownerId });
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  return restaurant;
}

async function buildQrImage(qrUrl) {
  const buffer = await QRCode.toBuffer(qrUrl, {
    type: "png",
    width: 1024,
    margin: 2,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
  return uploadQrImage(buffer);
}

export async function generateRestaurantQR(ownerId, options = {}) {
  const restaurant = await getOwnedRestaurant(ownerId);

  if (!restaurant.slug) {
    throw new AppError("Restaurant slug is required before generating a QR code", 400);
  }

  if (!restaurant.onboardingCompleted) {
    throw new AppError("Complete onboarding before generating a QR code", 400);
  }

  const { type = "Restaurant", tableId, roomId } = options;

  if (type === "Table" && (!tableId || !await Table.findOne({ restaurantId: restaurant._id, tableNumber: tableId }))) {
    throw new AppError("Table not found for this restaurant", 400);
  }
  if (type === "Room" && (!roomId || !await Room.findOne({ restaurantId: restaurant._id, roomNumber: roomId }))) {
    throw new AppError("Room not found for this restaurant", 400);
  }

  let qr = await QRCodeModel.findOne({ 
    restaurantId: restaurant._id,
    type,
    ...(tableId && { tableId }),
    ...(roomId && { roomId }),
  });

  if (!qr) {
    qr = new QRCodeModel({ 
      restaurantId: restaurant._id,
      type,
      ...(tableId && { tableId }),
      ...(roomId && { roomId }),
    });
  }

  // Build URL based on type
  const qrUrl = `${env.clientUrl}/restaurant/${restaurant.slug}?qr=${qr._id}`;

  const uploadResult = await buildQrImage(qrUrl);

  if (qr?.qrImagePublicId) {
    await deleteQrImage(qr.qrImagePublicId);
  }

  qr.slug = restaurant.slug;
  qr.qrUrl = qrUrl;
  qr.qrImageUrl = uploadResult.secure_url;
  qr.qrImagePublicId = uploadResult.public_id;
  qr.active = true;
  await qr.save();

  return sanitizeQR(qr, restaurant.restaurantName);
}

export async function getRestaurantQR(ownerId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const qr = await QRCodeModel.findOne({ restaurantId: restaurant._id });
  return qr ? sanitizeQR(qr, restaurant.restaurantName) : null;
}

export async function getRestaurantQRs(ownerId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const qrs = await QRCodeModel.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 });
  return qrs.map((qr) => sanitizeQR(qr, restaurant.restaurantName));
}

export async function getQRById(ownerId, qrId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const qr = await QRCodeModel.findOne({ _id: qrId, restaurantId: restaurant._id });

  if (!qr) {
    throw new AppError("QR code not found", 404);
  }

  return sanitizeQR(qr, restaurant.restaurantName);
}

export async function updateQRActive(ownerId, qrId, active) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const qr = await QRCodeModel.findOne({ _id: qrId, restaurantId: restaurant._id });

  if (!qr) {
    throw new AppError("QR code not found", 404);
  }

  qr.active = active;
  await qr.save();

  return sanitizeQR(qr, restaurant.restaurantName);
}

export async function deleteQR(ownerId, qrId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const qr = await QRCodeModel.findOne({ _id: qrId, restaurantId: restaurant._id });

  if (!qr) {
    throw new AppError("QR code not found", 404);
  }

  if (qr.qrImagePublicId) {
    await deleteQrImage(qr.qrImagePublicId);
  }

  await qr.deleteOne();
  return { message: "QR code deleted successfully" };
}

export async function recordScanBySlug(slug) {
  const restaurant = await Restaurant.findOne({ slug: slug.toLowerCase().trim() });

  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  const qr = await QRCodeModel.findOne({ restaurantId: restaurant._id, active: true });

  if (!qr) {
    throw new AppError("QR code not found", 404);
  }

  qr.scans += 1;
  qr.lastScannedAt = new Date();
  await qr.save();

  return { scans: qr.scans, lastScannedAt: qr.lastScannedAt };
}
