import * as menuItemService from "../services/menuItem.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.createMenuItem(req.user.id, req.body, req.file);
  res.status(201).json({ success: true, data: { item } });
});

export const listMenuItems = asyncHandler(async (req, res) => {
  const items = await menuItemService.listMenuItems(req.user.id, {
    categoryId: req.query.categoryId,
  });
  res.json({ success: true, data: { items } });
});

export const getMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.getMenuItemById(req.user.id, req.params.id);
  res.json({ success: true, data: { item } });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.updateMenuItem(req.user.id, req.params.id, req.body, req.file);
  res.json({ success: true, data: { item } });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const result = await menuItemService.deleteMenuItem(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});
