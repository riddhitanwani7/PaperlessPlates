import { Category } from "../models/Category.js";
import { MenuItem } from "../models/MenuItem.js";
import { Restaurant } from "../models/Restaurant.js";
import { AppError } from "../utils/AppError.js";
import { getOrderingContext } from "./ordering-context.service.js";

async function getPublicRestaurantRecord(slug, qrCodeId) {
  const context = await getOrderingContext(qrCodeId);
  if (context.restaurant.slug !== slug.toLowerCase().trim()) {
    throw new AppError("Invalid or expired ordering link. Please scan the QR code again.", 400);
  }
  return context.restaurant;
}

export async function getPublicRestaurantBySlug(slug, qrCodeId) {
  const context = await getOrderingContext(qrCodeId);
  const restaurant = context.restaurant;
  if (restaurant.slug !== slug.toLowerCase().trim()) {
    throw new AppError("Invalid or expired ordering link. Please scan the QR code again.", 400);
  }

  return {
    id: restaurant._id.toString(),
    restaurantName: restaurant.restaurantName,
    description: restaurant.description || "",
    logoUrl: restaurant.logoUrl || "",
    coverImageUrl: restaurant.coverImageUrl || "",
    address: restaurant.address || "",
    menuFileUrl: restaurant.menuFileUrl || null,
    menuFileType: restaurant.menuFileType || null,
    menuMode: restaurant.menuMode || "DOCUMENT",
    slug: restaurant.slug,
    qrCodeId: context.qr._id.toString(),
    orderContext: {
      type: context.orderType,
      tableId: context.tableId,
      roomId: context.roomId,
    },
    onlinePaymentsEnabled: restaurant.paymentSettings?.provider === "razorpay"
      && restaurant.paymentSettings.paymentsEnabled
      && !!(restaurant.paymentSettings.keyId && restaurant.paymentSettings.encryptedKeySecret),
    theme: {
      primaryColor: restaurant.theme?.primaryColor || "#f97316",
      secondaryColor: restaurant.theme?.secondaryColor || "#1e293b",
      accentColor: restaurant.theme?.accentColor || "#f97316",
      mode: restaurant.theme?.mode || "light",
      fontFamily: restaurant.theme?.fontFamily || "Inter",
      borderRadius: restaurant.theme?.borderRadius || "0.875rem",
    },
    settings: {
      currency: restaurant.settings?.currency || "INR",
      language: restaurant.settings?.language || "en",
      dateFormat: restaurant.settings?.dateFormat || "DD/MM/YYYY",
      timezone: restaurant.settings?.timezone || "Asia/Kolkata",
    },
  };
}

export async function getPublicCategoriesBySlug(slug, qrCodeId) {
  const restaurant = await getPublicRestaurantRecord(slug, qrCodeId);
  const categories = await Category.find({
    restaurantId: restaurant._id,
    active: true,
  }).sort({ sortOrder: 1, name: 1 });

  return categories.map((category) => ({
    id: category._id,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
  }));
}

export async function getPublicMenuBySlug(slug, qrCodeId) {
  const restaurant = await getPublicRestaurantRecord(slug, qrCodeId);
  const categories = await Category.find({
    restaurantId: restaurant._id,
    active: true,
  });
  const activeCategoryIds = categories.map((category) => category._id);
  const categoryMap = new Map(categories.map((category) => [category._id.toString(), category.name]));

  const items = await MenuItem.find({
    restaurantId: restaurant._id,
    categoryId: { $in: activeCategoryIds },
    available: true,
  }).sort({ popular: -1, name: 1 });

  return items.map((item) => ({
    id: item._id,
    categoryId: item.categoryId,
    category: categoryMap.get(item.categoryId.toString()) ?? "Uncategorized",
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    image: item.imageUrl,
    available: item.available,
    popular: item.popular,
    dietaryTags: item.dietaryTags,
    tags: item.dietaryTags,
  }));
}
