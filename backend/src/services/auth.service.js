import crypto from "crypto";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
import { sendPasswordResetEmail } from "./email.service.js";

const PASSWORD_RULE = /^(?=.*\d).{8,}$/;

function assertPassword(password) {
  if (!PASSWORD_RULE.test(password)) {
    throw new AppError("Password must be at least 8 characters and include one number", 400);
  }
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    isOnboarded: user.isOnboarded,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser({ name, email, password }) {
  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  assertPassword(password);

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  const token = signToken(user._id.toString());

  return { user: sanitizeUser(user), token };
}

export async function loginUser({ email, password }) {
  if (!email?.trim() || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id.toString());

  return { user: sanitizeUser(user), token };
}

export async function requestPasswordReset(email) {
  if (!email?.trim()) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Do not reveal whether the email exists
    return { message: "If that email is registered, a reset link has been sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetToken,
  });

  return { message: "If that email is registered, a reset link has been sent." };
}

export async function resetPassword({ token, password }) {
  if (!token || !password) {
    throw new AppError("Token and new password are required", 400);
  }

  assertPassword(password);

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) {
    throw new AppError("Password reset token is invalid or has expired", 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const jwt = signToken(user._id.toString());

  return {
    message: "Password updated successfully",
    user: sanitizeUser(user),
    token: jwt,
  };
}

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return sanitizeUser(user);
}
