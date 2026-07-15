import * as restaurantService from "../services/restaurant.service.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hasFeature } from "../services/subscription.helper.js";
import {Restaurant} from "../models/Restaurant.js";

export const saveOnboarding = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.upsertOnboarding(req.user.id, req.body);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantForUser(req.user);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const result = await restaurantService.completeOnboarding(req.user.id);
  res.json({
    success: true,
    data: result,
  });
});

export const getMyMenu = asyncHandler(async (req, res) => {
  const menu = await restaurantService.getMenuForOwner(req.user.id);
  res.json({
    success: true,
    data: { menu },
  });
});

export const uploadMenu = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Menu file is required", 400);
  }

  const menu = await restaurantService.uploadMenuForOwner(req.user.id, req.file);
  res.json({
    success: true,
    data: { menu },
  });
});

export const deleteMenu = asyncHandler(async (req, res) => {
  const result = await restaurantService.deleteMenuForOwner(req.user.id);
  res.json({
    success: true,
    data: result,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurantProfile(req.user, req.body);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Logo file is required", 400);
  }
  const restaurant = await restaurantService.uploadRestaurantLogo(req.user, req.file);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const uploadCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Cover image file is required", 400);
  }
  const restaurant = await restaurantService.uploadRestaurantCoverImage(req.user, req.file);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const updateTheme = asyncHandler(async (req, res) => {
  // STARTER plan is locked to the single default theme; only ENTERPRISE
  // ("Multiple Themes") may customize colors, mode, font, or border radius.
  const existing = await Restaurant.findById(req.user.restaurantId);
  if (!hasFeature(existing, "multipleThemes")) {
    return res.status(403).json({
      success: false,
      message: "Theme customization requires the ENTERPRISE plan. Contact PaperlessPlates to upgrade.",
    });
  }

  const restaurant = await restaurantService.updateRestaurantTheme(req.user, req.body);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurantSettings(req.user, req.body);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const getPaymentSettings = asyncHandler(async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/api`;
  const paymentSettings = await restaurantService.getRestaurantPaymentSettings(req.user, baseUrl);
  res.json({
    success: true,
    data: paymentSettings,
  });
});

export const savePaymentSettings = asyncHandler(async (req, res) => {
  // Check if restaurant has online payments feature
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  if (!hasFeature(restaurant, "onlinePayments")) {
    return res.status(403).json({
      success: false,
      message: "Online payments are not available in your current plan. Contact PaperlessPlates to upgrade.",
    });
  }

  await restaurantService.saveRestaurantPaymentSettings(req.user, req.body);
  const baseUrl = `${req.protocol}://${req.get("host")}/api`;
  const paymentSettings = await restaurantService.getRestaurantPaymentSettings(req.user, baseUrl);
  res.json({
    success: true,
    data: paymentSettings,
  });
});

export const testPaymentSettings = asyncHandler(async (req, res) => {
  const result = await restaurantService.testRestaurantPaymentSettings(req.user, req.body);
  res.json({
    success: true,
    message: result.message,
  });
});
