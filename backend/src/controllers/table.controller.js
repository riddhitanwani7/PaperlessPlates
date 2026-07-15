import * as tableService from "../services/table.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { canCreateResource } from "../services/subscription.helper.js";
import {Restaurant} from "../models/Restaurant.js";

export const createTable = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account",
    });
  }

  // Check table limit
  const restaurant = await Restaurant.findById(restaurantId);
  const currentTables = await tableService.getTablesByRestaurant(restaurantId);
  const limitCheck = canCreateResource(restaurant, "tables", currentTables.length);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      success: false,
      message: limitCheck.message,
    });
  }

  const table = await tableService.createTable({ ...req.body, restaurantId });
  res.status(201).json({
    success: true,
    data: { table },
  });
});

export const getRestaurantTables = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account",
    });
  }
  const tables = await tableService.getTablesByRestaurant(restaurantId);
  res.json({
    success: true,
    data: { tables },
  });
});

export const getTableById = asyncHandler(async (req, res) => {
  const table = await tableService.getTableById(req.params.id);
  res.json({
    success: true,
    data: { table },
  });
});

export const updateTable = asyncHandler(async (req, res) => {
  const table = await tableService.updateTable(req.params.id, req.body);
  res.json({
    success: true,
    data: { table },
  });
});

export const deleteTable = asyncHandler(async (req, res) => {
  const result = await tableService.deleteTable(req.params.id);
  res.json({
    success: true,
    data: result,
  });
});
