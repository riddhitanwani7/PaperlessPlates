/**
 * Migration script to link existing owner users to their restaurants
 * 
 * This script fixes the issue where existing users who completed onboarding
 * before the restaurantId field was added don't have restaurantId set.
 * 
 * Run with: node src/scripts/migrate-restaurantId.js
 */

import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Restaurant } from "../models/Restaurant.js";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Find all users who are onboarded but don't have restaurantId
    const usersWithoutRestaurantId = await User.find({
      isOnboarded: true,
      restaurantId: { $exists: false }
    });

    console.log(`Found ${usersWithoutRestaurantId.length} onboarded users without restaurantId`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithoutRestaurantId) {
      // Find the restaurant owned by this user
      const restaurant = await Restaurant.findOne({ ownerId: user._id });

      if (restaurant) {
        // Link the user to their restaurant
        user.restaurantId = restaurant._id;
        await user.save();
        console.log(`✓ Linked user ${user.email} to restaurant ${restaurant._id}`);
        updatedCount++;
      } else {
        console.log(`✗ No restaurant found for user ${user.email} - skipped`);
        skippedCount++;
      }
    }

    // Also check for users with null restaurantId
    const usersWithNullRestaurantId = await User.find({
      isOnboarded: true,
      restaurantId: null
    });

    console.log(`Found ${usersWithNullRestaurantId.length} onboarded users with null restaurantId`);

    for (const user of usersWithNullRestaurantId) {
      const restaurant = await Restaurant.findOne({ ownerId: user._id });

      if (restaurant) {
        user.restaurantId = restaurant._id;
        await user.save();
        console.log(`✓ Fixed null restaurantId for user ${user.email}`);
        updatedCount++;
      } else {
        console.log(`✗ No restaurant found for user ${user.email} - skipped`);
        skippedCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total users updated: ${updatedCount}`);
    console.log(`Total users skipped: ${skippedCount}`);

    // Verify the migration
    const remainingUsers = await User.find({
      isOnboarded: true,
      $or: [
        { restaurantId: { $exists: false } },
        { restaurantId: null }
      ]
    });

    if (remainingUsers.length === 0) {
      console.log("✓ All onboarded users now have restaurantId");
    } else {
      console.log(`⚠ ${remainingUsers.length} onboarded users still without restaurantId`);
    }

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  }
}

migrate();
