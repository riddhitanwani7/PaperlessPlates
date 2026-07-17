import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.json({
    success: true,
    data: result,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  console.info("[password-reset] Forgot password request received");
  const result = await authService.requestPasswordReset(req.body.email);
  res.json({
    success: true,
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.json({
    success: true,
    data: result,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.json({
    success: true,
    data: { user },
  });
});
