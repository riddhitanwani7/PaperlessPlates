import * as qrService from "../services/qr.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { canCreateResource } from "../services/subscription.helper.js";
import {Restaurant} from "../models/Restaurant.js";

export const generateQR = asyncHandler(async (req, res) => {
  const { type, tableId, roomId } = req.body;
  
  // Check QR limit
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  const currentQRs = await qrService.getRestaurantQRs(req.user.id);
  const limitCheck = canCreateResource(restaurant, "qrCodes", currentQRs.length);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      success: false,
      message: limitCheck.message,
    });
  }

  const qr = await qrService.generateRestaurantQR(req.user.id, { type, tableId, roomId });
  res.status(201).json({
    success: true,
    data: { qr },
  });
});

export const getMyQR = asyncHandler(async (req, res) => {
  const qrs = await qrService.getRestaurantQRs(req.user.id);
  res.json({
    success: true,
    data: { qrs },
  });
});

export const getQRById = asyncHandler(async (req, res) => {
  const qr = await qrService.getQRById(req.user.id, req.params.id);
  res.json({
    success: true,
    data: { qr },
  });
});

export const updateQR = asyncHandler(async (req, res) => {
  if (typeof req.body.active !== "boolean") {
    throw new AppError("Active status is required", 400);
  }

  const qr = await qrService.updateQRActive(req.user.id, req.params.id, req.body.active);
  res.json({
    success: true,
    data: { qr },
  });
});

export const deleteQR = asyncHandler(async (req, res) => {
  const result = await qrService.deleteQR(req.user.id, req.params.id);
  res.json({
    success: true,
    data: result,
  });
});
