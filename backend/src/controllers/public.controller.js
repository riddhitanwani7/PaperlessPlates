import * as publicService from "../services/public.service.js";
import * as menuItemService from "../services/menuItem.service.js";
import * as qrService from "../services/qr.service.js";
import { getOrderingContext } from "../services/ordering-context.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPublicRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await publicService.getPublicRestaurantBySlug(req.params.slug, req.query.qr);
  res.json({
    success: true,
    data: { restaurant },
  });
});

export const getPublicCategories = asyncHandler(async (req, res) => {
  const categories = await publicService.getPublicCategoriesBySlug(req.params.slug, req.query.qr);
  res.json({
    success: true,
    data: { categories },
  });
});

export const getPublicMenu = asyncHandler(async (req, res) => {
  const items = await publicService.getPublicMenuBySlug(req.params.slug, req.query.qr);
  res.json({
    success: true,
    data: { items },
  });
});

export const getPublicMenuItem = asyncHandler(async (req, res) => {
  const context = await getOrderingContext(req.query.qr);
  const item = await menuItemService.getPublicMenuItemById(req.params.id, context.restaurant._id);
  res.json({
    success: true,
    data: { item },
  });
});

export const recordScan = asyncHandler(async (req, res) => {
  const scan = await qrService.recordScanBySlug(req.params.slug);
  res.json({
    success: true,
    data: scan,
  });
});
