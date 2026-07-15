import * as staffService from "../services/staff.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hasFeature, canCreateResource } from "../services/subscription.helper.js";
import {Restaurant} from "../models/Restaurant.js";

export const getStaffList = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account. Please complete onboarding first.",
    });
  }
  const staff = await staffService.getStaffList(restaurantId);
  res.json({
    success: true,
    data: staff,
  });
});

export const addStaff = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account. Please complete onboarding first.",
    });
  }

  const restaurant = await Restaurant.findById(restaurantId);

  if (!hasFeature(restaurant, "staffManagement")) {
    return res.status(403).json({
      success: false,
      message: "Staff management is not available on your current plan.",
    });
  }

  // Check staff limit
  const currentStaff = await staffService.getStaffList(restaurantId);
  const limitCheck = canCreateResource(restaurant, "staffMembers", currentStaff.length);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      success: false,
      message: limitCheck.message,
    });
  }

  const staff = await staffService.addStaff(restaurantId, req.body);
  res.json({
    success: true,
    data: staff,
  });
});

export const updateStaffRole = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const { role } = req.body;
  const restaurantId = req.user.restaurantId;
  const staff = await staffService.updateStaffRole(staffId, role, restaurantId);
  res.json({
    success: true,
    data: staff,
  });
});

export const deactivateStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const restaurantId = req.user.restaurantId;
  const staff = await staffService.deactivateStaff(staffId, restaurantId);
  res.json({
    success: true,
    data: staff,
  });
});

export const activateStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const restaurantId = req.user.restaurantId;
  const staff = await staffService.activateStaff(staffId, restaurantId);
  res.json({
    success: true,
    data: staff,
  });
});
