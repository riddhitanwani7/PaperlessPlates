import mongoose from "mongoose";
import { QRCode } from "../models/QRCode.js";
import { Restaurant } from "../models/Restaurant.js";
import { Table } from "../models/Table.js";
import { Room } from "../models/Room.js";
import { AppError } from "../utils/AppError.js";

const INVALID_LINK_MESSAGE = "Invalid or expired ordering link. Please scan the QR code again.";

export async function getOrderingContext(qrCodeId, requestedRestaurantId) {
  if (!qrCodeId || !mongoose.isValidObjectId(qrCodeId)) {
    throw new AppError(INVALID_LINK_MESSAGE, 400);
  }

  const qr = await QRCode.findOne({ _id: qrCodeId, active: true });
  if (!qr) throw new AppError(INVALID_LINK_MESSAGE, 400);

  const restaurant = await Restaurant.findById(qr.restaurantId);
  if (!restaurant?.onboardingCompleted) throw new AppError(INVALID_LINK_MESSAGE, 400);

  if (requestedRestaurantId && requestedRestaurantId !== restaurant._id.toString()) {
    throw new AppError(INVALID_LINK_MESSAGE, 400);
  }

  if (qr.type === "Table") {
    const table = await Table.findOne({ restaurantId: restaurant._id, tableNumber: qr.tableId });
    if (!table) throw new AppError(INVALID_LINK_MESSAGE, 400);
  }

  if (qr.type === "Room") {
    const room = await Room.findOne({ restaurantId: restaurant._id, roomNumber: qr.roomId });
    if (!room) throw new AppError(INVALID_LINK_MESSAGE, 400);
  }

  return {
    restaurant,
    qr,
    orderType: qr.type === "Table" ? "TABLE" : qr.type === "Room" ? "ROOM" : qr.type === "Takeaway" ? "TAKEAWAY" : "RESTAURANT",
    tableId: qr.type === "Table" ? qr.tableId : undefined,
    roomId: qr.type === "Room" ? qr.roomId : undefined,
  };
}
