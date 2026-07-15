import * as roomService from "../services/room.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { canCreateResource } from "../services/subscription.helper.js";
import {Restaurant} from "../models/Restaurant.js";

export const createRoom = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account",
    });
  }

  // Room management is available on every plan (Basic included), bounded by
  // the plan's room limit — it is not a Premium-only feature.
  const restaurant = await Restaurant.findById(restaurantId);

  // Check room limit
  const currentRooms = await roomService.getRoomsByRestaurant(restaurantId);
  const limitCheck = canCreateResource(restaurant, "rooms", currentRooms.length);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      success: false,
      message: limitCheck.message,
    });
  }

  const room = await roomService.createRoom({ ...req.body, restaurantId });
  res.status(201).json({
    success: true,
    data: { room },
  });
});

export const getRestaurantRooms = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account",
    });
  }
  const rooms = await roomService.getRoomsByRestaurant(restaurantId);
  res.json({
    success: true,
    data: { rooms },
  });
});

export const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  res.json({
    success: true,
    data: { room },
  });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body);
  res.json({
    success: true,
    data: { room },
  });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const result = await roomService.deleteRoom(req.params.id);
  res.json({
    success: true,
    data: result,
  });
});
