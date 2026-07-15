import * as analyticsService from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hasFeature } from "../services/subscription.helper.js";
import {Restaurant} from "../models/Restaurant.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Check if restaurant has analytics feature (Basic+ all have basic analytics)
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  // All plans have basic analytics, so no blocking needed
  // But we can flag advanced features based on plan
  const hasAdvancedAnalytics = hasFeature(restaurant, "advancedAnalytics");
  const analytics = await analyticsService.getAnalytics(restaurantId);

  res.json({
    success: true,
    data: {
      ...analytics,
      hasAdvancedAnalytics,
    },
  });
});
