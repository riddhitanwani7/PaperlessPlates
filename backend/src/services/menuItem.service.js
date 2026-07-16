import { Category } from "../models/Category.js";
import { MenuItem } from "../models/MenuItem.js";
import { Restaurant } from "../models/Restaurant.js";
import { AppError } from "../utils/AppError.js";
import { parseBoolean, parseDietaryTags } from "../utils/parse.js";
import { deleteFoodImage, uploadFoodImage } from "./upload.service.js";
import { getOwnedRestaurant } from "./restaurant.service.js";

function sanitizeMenuItem(item, categoryName) {
  return {
    id: item._id,
    restaurantId: item.restaurantId,
    categoryId: item.categoryId,
    category: categoryName,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    image: item.imageUrl,
    available: item.available,
    popular: item.popular,
    dietaryTags: item.dietaryTags,
    tags: item.dietaryTags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function getCategoryForRestaurant(restaurantId, categoryId) {
  const category = await Category.findOne({ _id: categoryId, restaurantId });
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
}

async function getOwnedMenuItem(ownerId, itemId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const item = await MenuItem.findOne({ _id: itemId, restaurantId: restaurant._id });

  if (!item) {
    throw new AppError("Menu item not found", 404);
  }

  return { restaurant, item };
}

function buildMenuItemPayload(body) {
  return {
    name: body.name?.trim(),
    description: body.description?.trim() || "",
    price: body.price !== undefined ? Number(body.price) : undefined,
    categoryId: body.categoryId,
    available: body.available !== undefined ? parseBoolean(body.available, true) : undefined,
    popular: body.popular !== undefined ? parseBoolean(body.popular, false) : undefined,
    dietaryTags:
      body.dietaryTags !== undefined ? parseDietaryTags(body.dietaryTags) : undefined,
  };
}

export async function createMenuItem(ownerId, body, file) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const payload = buildMenuItemPayload(body);

  if (!payload.name) {
    throw new AppError("Item name is required", 400);
  }

  if (!payload.categoryId) {
    throw new AppError("Category is required", 400);
  }

  if (payload.price === undefined || Number.isNaN(payload.price) || payload.price < 0) {
    throw new AppError("A valid price is required", 400);
  }

  const category = await getCategoryForRestaurant(restaurant._id, payload.categoryId);

  const item = new MenuItem({
    restaurantId: restaurant._id,
    categoryId: category._id,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    available: payload.available ?? true,
    popular: payload.popular ?? false,
    dietaryTags: payload.dietaryTags ?? [],
  });

  if (file) {
    const upload = await uploadFoodImage(file.buffer);
    item.imageUrl = upload.secure_url;
    item.imagePublicId = upload.public_id;
  }

  await item.save();
  return sanitizeMenuItem(item, category.name);
}

export async function listMenuItems(ownerId, { categoryId } = {}) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const query = { restaurantId: restaurant._id };

  if (categoryId) {
    query.categoryId = categoryId;
  }

  const items = await MenuItem.find(query).sort({ createdAt: -1 });
  const categories = await Category.find({ restaurantId: restaurant._id });
  const categoryMap = new Map(categories.map((category) => [category._id.toString(), category.name]));

  return items.map((item) =>
    sanitizeMenuItem(item, categoryMap.get(item.categoryId.toString()) ?? "Uncategorized"),
  );
}

export async function getMenuItemById(ownerId, itemId) {
  const { item } = await getOwnedMenuItem(ownerId, itemId);
  const category = await Category.findById(item.categoryId);
  return sanitizeMenuItem(item, category?.name ?? "Uncategorized");
}

export async function updateMenuItem(ownerId, itemId, body, file) {
  const { item } = await getOwnedMenuItem(ownerId, itemId);
  const payload = buildMenuItemPayload(body);
  let categoryName = (await Category.findById(item.categoryId))?.name ?? "Uncategorized";

  if (payload.name !== undefined) {
    if (!payload.name) {
      throw new AppError("Item name is required", 400);
    }
    item.name = payload.name;
  }

  if (payload.description !== undefined) {
    item.description = payload.description;
  }

  if (payload.price !== undefined) {
    if (Number.isNaN(payload.price) || payload.price < 0) {
      throw new AppError("A valid price is required", 400);
    }
    item.price = payload.price;
  }

  if (payload.categoryId !== undefined) {
    const category = await getCategoryForRestaurant(item.restaurantId, payload.categoryId);
    item.categoryId = category._id;
    categoryName = category.name;
  }

  if (payload.available !== undefined) {
    item.available = payload.available;
  }

  if (payload.popular !== undefined) {
    item.popular = payload.popular;
  }

  if (payload.dietaryTags !== undefined) {
    item.dietaryTags = payload.dietaryTags;
  }

  if (file) {
    if (item.imagePublicId) {
      await deleteFoodImage(item.imagePublicId);
    }
    const upload = await uploadFoodImage(file.buffer);
    item.imageUrl = upload.secure_url;
    item.imagePublicId = upload.public_id;
  }

  await item.save();
  return sanitizeMenuItem(item, categoryName);
}

export async function deleteMenuItem(ownerId, itemId) {
  const { item } = await getOwnedMenuItem(ownerId, itemId);

  if (item.imagePublicId) {
    await deleteFoodImage(item.imagePublicId);
  }

  await item.deleteOne();
  return { message: "Menu item deleted successfully" };
}

export async function getPublicMenuItemById(itemId, restaurantId) {
  const item = await MenuItem.findOne({ _id: itemId, restaurantId });

  if (!item || !item.available) {
    throw new AppError("Menu item not found", 404);
  }

  const [restaurant, category] = await Promise.all([
    Restaurant.findById(item.restaurantId),
    Category.findById(item.categoryId),
  ]);

  if (!restaurant?.onboardingCompleted) {
    throw new AppError("Menu item not found", 404);
  }

  const categoryActive = category?.active ?? true;
  if (!categoryActive) {
    throw new AppError("Menu item not found", 404);
  }

  return sanitizeMenuItem(item, category?.name ?? "Uncategorized");
}
