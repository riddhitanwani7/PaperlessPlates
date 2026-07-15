import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PLANS } from "../config/plans.js";

export const getAllRestaurants = asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  let query = {};
  
  if (search) {
    query = {
      $or: [
        { restaurantName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }
  
  const restaurants = await Restaurant.find(query)
    .select("restaurantName email phone selectedPlan onboardingCompleted createdAt")
    .lean();
    
  const restaurantIds = restaurants.map(r => r._id);
  const owners = await User.find({ restaurantId: { $in: restaurantIds } })
    .select("name email restaurantId")
    .lean();
    
  const ownerMap = new Map();
  owners.forEach(owner => {
    ownerMap.set(owner.restaurantId.toString(), owner);
  });
  
  const result = restaurants.map(restaurant => {
    const owner = ownerMap.get(restaurant._id.toString());
    return {
      id: restaurant._id,
      restaurantName: restaurant.restaurantName,
      email: restaurant.email,
      phone: restaurant.phone,
      selectedPlan: restaurant.selectedPlan,
      onboardingCompleted: restaurant.onboardingCompleted,
      ownerName: owner?.name || null,
      ownerEmail: owner?.email || null,
      createdAt: restaurant.createdAt,
    };
  });
  
  res.json({
    success: true,
    data: result,
  });
});

export const updateRestaurantPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { selectedPlan } = req.body;
  
  if (!selectedPlan) {
    throw new AppError("selectedPlan is required", 400);
  }
  
  if (!PLANS.includes(selectedPlan)) {
    throw new AppError("Invalid plan", 400);
  }
  
  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  
  restaurant.selectedPlan = selectedPlan;
  await restaurant.save();
  
  res.json({
    success: true,
    data: {
      id: restaurant._id,
      restaurantName: restaurant.restaurantName,
      selectedPlan: restaurant.selectedPlan,
    },
  });
});
