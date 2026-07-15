import * as categoryService from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user.id, req.body);
  res.status(201).json({ success: true, data: { category } });
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.user.id);
  res.json({ success: true, data: { categories } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});
