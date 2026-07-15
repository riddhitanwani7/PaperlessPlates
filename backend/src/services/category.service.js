import { Category } from "../models/Category.js";
import { MenuItem } from "../models/MenuItem.js";
import { AppError } from "../utils/AppError.js";
import { deleteFoodImage } from "./upload.service.js";
import { getOwnedRestaurant } from "./restaurant.service.js";

function sanitizeCategory(category, itemCount = 0) {
  return {
    id: category._id,
    restaurantId: category.restaurantId,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    active: category.active,
    items: itemCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

async function getOwnedCategory(ownerId, categoryId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const category = await Category.findOne({ _id: categoryId, restaurantId: restaurant._id });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return { restaurant, category };
}

export async function createCategory(ownerId, payload) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const name = payload.name?.trim();

  if (!name) {
    throw new AppError("Category name is required", 400);
  }

  const existing = await Category.findOne({ restaurantId: restaurant._id, name });
  if (existing) {
    throw new AppError("A category with this name already exists", 409);
  }

  const category = await Category.create({
    restaurantId: restaurant._id,
    name,
    description: payload.description?.trim() || "",
    sortOrder: payload.sortOrder ?? 0,
    active: payload.active ?? true,
  });

  return sanitizeCategory(category, 0);
}

export async function listCategories(ownerId) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const categories = await Category.find({ restaurantId: restaurant._id }).sort({
    sortOrder: 1,
    name: 1,
  });

  const counts = await MenuItem.aggregate([
    { $match: { restaurantId: restaurant._id } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((entry) => [entry._id.toString(), entry.count]));

  return categories.map((category) =>
    sanitizeCategory(category, countMap.get(category._id.toString()) ?? 0),
  );
}

export async function updateCategory(ownerId, categoryId, payload) {
  const { category } = await getOwnedCategory(ownerId, categoryId);

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) {
      throw new AppError("Category name is required", 400);
    }

    const duplicate = await Category.findOne({
      restaurantId: category.restaurantId,
      name,
      _id: { $ne: category._id },
    });

    if (duplicate) {
      throw new AppError("A category with this name already exists", 409);
    }

    category.name = name;
  }

  if (payload.description !== undefined) {
    category.description = payload.description.trim();
  }

  if (payload.sortOrder !== undefined) {
    category.sortOrder = payload.sortOrder;
  }

  if (payload.active !== undefined) {
    category.active = payload.active;
  }

  await category.save();

  const itemCount = await MenuItem.countDocuments({ categoryId: category._id });
  return sanitizeCategory(category, itemCount);
}

export async function deleteCategory(ownerId, categoryId) {
  const { category } = await getOwnedCategory(ownerId, categoryId);
  const items = await MenuItem.find({ categoryId: category._id });

  for (const item of items) {
    if (item.imagePublicId) {
      await deleteFoodImage(item.imagePublicId);
    }
  }

  await MenuItem.deleteMany({ categoryId: category._id });
  await category.deleteOne();

  return { message: "Category deleted successfully" };
}
