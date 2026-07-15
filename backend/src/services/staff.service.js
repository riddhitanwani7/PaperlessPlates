import { User } from "../models/User.js";
import { Restaurant } from "../models/Restaurant.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AppError } from "../utils/AppError.js";

export async function getStaffList(restaurantId) {
  const staff = await User.find({ restaurantId })
    .select("name email role status createdAt")
    .sort({ createdAt: -1 });

  return staff.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || "ACTIVE",
    createdAt: user.createdAt,
  }));
}

export async function addStaff(restaurantId, staffData) {
  const { name, email, role, password } = staffData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  // Generate temporary password if not provided
  const tempPassword = password || crypto.randomBytes(8).toString("hex");

  // Create staff user
  const staff = await User.create({
    name,
    email,
    password: tempPassword,
    role,
    restaurantId,
    status: "ACTIVE",
  });

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    status: staff.status,
    createdAt: staff.createdAt,
    temporaryPassword: tempPassword,
  };
}

export async function updateStaffRole(staffId, newRole, restaurantId) {
  const staff = await User.findOne({ _id: staffId, restaurantId });
  if (!staff) {
    throw new AppError("Staff member not found", 404);
  }

  staff.role = newRole;
  await staff.save();

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    status: staff.status || "ACTIVE",
    createdAt: staff.createdAt,
  };
}

export async function deactivateStaff(staffId, restaurantId) {
  const staff = await User.findOne({ _id: staffId, restaurantId });
  if (!staff) {
    throw new AppError("Staff member not found", 404);
  }

  staff.status = "INACTIVE";
  await staff.save();

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    status: staff.status,
    createdAt: staff.createdAt,
  };
}

export async function activateStaff(staffId, restaurantId) {
  const staff = await User.findOne({ _id: staffId, restaurantId });
  if (!staff) {
    throw new AppError("Staff member not found", 404);
  }

  staff.status = "ACTIVE";
  await staff.save();

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    status: staff.status,
    createdAt: staff.createdAt,
  };
}
