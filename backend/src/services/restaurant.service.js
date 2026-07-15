import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slug.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import Razorpay from "razorpay";
import {
  deleteMenuFile,
  uploadMenuFile,
  uploadRestaurantImage,
  uploadRestaurantCoverImage as uploadCoverToCloudinary,
  deleteRestaurantImage,
} from "./upload.service.js";
import {
  PLAN_CATALOG,
  getPlanById,
  getPlanFeatures,
  normalizePlan,
} from "../config/plans.js";

const MIME_TO_FILE_TYPE = {
  "application/pdf": "pdf",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
};

function sanitizeMenu(restaurant) {
  if (!restaurant?.menuFileUrl) {
    return null;
  }

  return {
    menuFileUrl: restaurant.menuFileUrl,
    menuFileType: restaurant.menuFileType,
    menuUploadedAt: restaurant.menuUploadedAt,
  };
}

function sanitizeRestaurant(restaurant) {
  return {
    id: restaurant._id,
    ownerId: restaurant.ownerId,
    restaurantName: restaurant.restaurantName,
    description: restaurant.description,
    logoUrl: restaurant.logoUrl,
    coverImageUrl: restaurant.coverImageUrl,
    slug: restaurant.slug,
    address: restaurant.address,
    phone: restaurant.phone,
    email: restaurant.email,
    businessType: restaurant.businessType,
    cuisine: restaurant.cuisine,
    selectedPlan: normalizePlan(restaurant.selectedPlan),
    pendingPlan: normalizePlan(restaurant.pendingPlan),
    subscriptionStatus: restaurant.subscriptionStatus,
    subscriptionExpiry: restaurant.subscriptionExpiry,
    subscription: restaurant.subscription,
    qrEnabled: restaurant.qrEnabled,
    onboardingCompleted: restaurant.onboardingCompleted,
    menuFileUrl: restaurant.menuFileUrl,
    menuFileType: restaurant.menuFileType,
    menuUploadedAt: restaurant.menuUploadedAt,
    menuMode: restaurant.menuMode,
    businessHours: restaurant.businessHours,
    taxRate: restaurant.taxRate,
    taxNumber: restaurant.taxNumber,
    socialMedia: restaurant.socialMedia,
    deliveryEnabled: restaurant.deliveryEnabled,
    deliveryRadius: restaurant.deliveryRadius,
    deliveryFee: restaurant.deliveryFee,
    minOrderAmount: restaurant.minOrderAmount,
    theme: restaurant.theme,
    settings: restaurant.settings,
    createdAt: restaurant.createdAt,
    updatedAt: restaurant.updatedAt,
  };
}

async function getOwnedRestaurant(ownerId) {
  const restaurant = await Restaurant.findOne({ ownerId });
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  return restaurant;
}

export async function getRestaurantDocForUser(user) {
  if (user.role === "OWNER") {
    return getOwnedRestaurant(user.id);
  }

  if (!user.restaurantId) {
    throw new AppError("Restaurant not found", 404);
  }

  const restaurant = await Restaurant.findById(user.restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  return restaurant;
}

export { getOwnedRestaurant };

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug || "restaurant";
  let suffix = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Restaurant.findOne(query).select("_id");
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function getRestaurantForOwner(ownerId) {
  const restaurant = await Restaurant.findOne({ ownerId });
  return restaurant ? sanitizeRestaurant(restaurant) : null;
}

export async function getRestaurantForUser(user) {
  try {
    const restaurant = await getRestaurantDocForUser(user);
    return sanitizeRestaurant(restaurant);
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

export async function upsertOnboarding(ownerId, payload) {
  const {
    restaurantName,
    address,
    phone,
    businessType,
    qrEnabled,
  } = payload;

  let restaurant = await Restaurant.findOne({ ownerId });

  if (!restaurant) {
    restaurant = new Restaurant({ ownerId });
  }

  if (restaurant.onboardingCompleted) {
    throw new AppError("Onboarding is already completed", 400);
  }

  if (restaurantName !== undefined) {
    const trimmed = restaurantName.trim();
    if (!trimmed) {
      throw new AppError("Restaurant name is required", 400);
    }
    restaurant.restaurantName = trimmed;
    const baseSlug = slugify(trimmed);
    restaurant.slug = await ensureUniqueSlug(baseSlug, restaurant._id);
  }

  if (address !== undefined) {
    restaurant.address = address.trim();
  }

  if (phone !== undefined) {
    restaurant.phone = phone.trim();
  }

  if (businessType !== undefined) {
    restaurant.businessType = businessType;
  }

  if (qrEnabled !== undefined) {
    restaurant.qrEnabled = qrEnabled;
    if (qrEnabled && !restaurant.slug && restaurant.restaurantName) {
      const baseSlug = slugify(restaurant.restaurantName);
      restaurant.slug = await ensureUniqueSlug(baseSlug, restaurant._id);
    }
  }

  await restaurant.save();
  return sanitizeRestaurant(restaurant);
}

export async function completeOnboarding(ownerId) {
  const restaurant = await Restaurant.findOne({ ownerId });

  if (!restaurant) {
    throw new AppError("Restaurant onboarding data not found", 404);
  }

  if (restaurant.onboardingCompleted) {
    throw new AppError("Onboarding is already completed", 400);
  }

  if (!restaurant.restaurantName?.trim()) {
    throw new AppError("Restaurant name is required before completing onboarding", 400);
  }

  if (!restaurant.slug) {
    const baseSlug = slugify(restaurant.restaurantName);
    restaurant.slug = await ensureUniqueSlug(baseSlug, restaurant._id);
  }

  restaurant.qrEnabled = true;
  restaurant.onboardingCompleted = true;

  // Keep the persisted value within the schema's supported plan IDs. Previous
  // code stored "Basic", which fails Mongoose enum validation and caused a 500.
  restaurant.selectedPlan = getPlanById(restaurant.selectedPlan).id;

  await restaurant.save();

  const user = await User.findById(ownerId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isOnboarded = true;
  user.restaurantId = restaurant._id;
  await user.save();

  return {
    restaurant: sanitizeRestaurant(restaurant),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      isOnboarded: user.isOnboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function getMenuForOwner(ownerId) {
  const restaurant = await Restaurant.findOne({ ownerId });
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  return sanitizeMenu(restaurant);
}

export async function uploadMenuForOwner(ownerId, file) {
  const restaurant = await getOwnedRestaurant(ownerId);
  const fileType = MIME_TO_FILE_TYPE[file.mimetype];

  if (!fileType) {
    throw new AppError("Only PDF, JPG, JPEG, and PNG files are allowed", 400);
  }

  if (restaurant.menuFilePublicId) {
    await deleteMenuFile(restaurant.menuFilePublicId, restaurant.menuFileType);
  }

  const result = await uploadMenuFile(file.buffer, fileType);

  restaurant.menuFileUrl = result.secure_url;
  restaurant.menuFilePublicId = result.public_id;
  restaurant.menuFileType = fileType;
  restaurant.menuUploadedAt = new Date();
  await restaurant.save();

  return sanitizeMenu(restaurant);
}

export async function deleteMenuForOwner(ownerId) {
  const restaurant = await getOwnedRestaurant(ownerId);

  if (!restaurant.menuFilePublicId) {
    throw new AppError("No menu file to delete", 404);
  }

  await deleteMenuFile(restaurant.menuFilePublicId, restaurant.menuFileType);

  restaurant.menuFileUrl = undefined;
  restaurant.menuFilePublicId = undefined;
  restaurant.menuFileType = undefined;
  restaurant.menuUploadedAt = undefined;
  await restaurant.save();

  return { message: "Menu deleted successfully" };
}

export async function updateRestaurantProfile(user, profileData) {
  const restaurant = await getRestaurantDocForUser(user);

  const {
    restaurantName,
    description,
    address,
    phone,
    email,
    businessType,
    cuisine,
    businessHours,
    taxRate,
    taxNumber,
    socialMedia,
    deliveryEnabled,
    deliveryRadius,
    deliveryFee,
    minOrderAmount,
  } = profileData;

  if (restaurantName !== undefined) restaurant.restaurantName = restaurantName;
  if (description !== undefined) restaurant.description = description;
  if (address !== undefined) restaurant.address = address;
  if (phone !== undefined) restaurant.phone = phone;
  if (email !== undefined) restaurant.email = email;
  if (businessType !== undefined) restaurant.businessType = businessType;
  if (cuisine !== undefined) restaurant.cuisine = cuisine;
  if (businessHours !== undefined) restaurant.businessHours = businessHours;
  if (taxRate !== undefined) restaurant.taxRate = taxRate;
  if (taxNumber !== undefined) restaurant.taxNumber = taxNumber;
  if (socialMedia !== undefined) restaurant.socialMedia = socialMedia;
  if (deliveryEnabled !== undefined) restaurant.deliveryEnabled = deliveryEnabled;
  if (deliveryRadius !== undefined) restaurant.deliveryRadius = deliveryRadius;
  if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
  if (minOrderAmount !== undefined) restaurant.minOrderAmount = minOrderAmount;

  await restaurant.save();
  return sanitizeRestaurant(restaurant);
}

export async function uploadRestaurantLogo(user, file) {
  const restaurant = await getRestaurantDocForUser(user);

  if (restaurant.logoPublicId) {
    await deleteRestaurantImage(restaurant.logoPublicId);
  }

  const upload = await uploadRestaurantImage(file.buffer);
  restaurant.logoUrl = upload.secure_url;
  restaurant.logoPublicId = upload.public_id;
  await restaurant.save();

  return sanitizeRestaurant(restaurant);
}

export async function uploadRestaurantCoverImage(user, file) {
  const restaurant = await getRestaurantDocForUser(user);

  if (restaurant.coverImagePublicId) {
    await deleteRestaurantImage(restaurant.coverImagePublicId);
  }

  const upload = await uploadCoverToCloudinary(file.buffer);
  restaurant.coverImageUrl = upload.secure_url;
  restaurant.coverImagePublicId = upload.public_id;
  await restaurant.save();

  return sanitizeRestaurant(restaurant);
}

export async function updateRestaurantTheme(user, themeData) {
  const restaurant = await getRestaurantDocForUser(user);

  const { primaryColor, secondaryColor, accentColor, mode, fontFamily, borderRadius } = themeData;

  if (primaryColor !== undefined) restaurant.theme.primaryColor = primaryColor;
  if (secondaryColor !== undefined) restaurant.theme.secondaryColor = secondaryColor;
  if (accentColor !== undefined) restaurant.theme.accentColor = accentColor;
  if (mode !== undefined) restaurant.theme.mode = mode;
  if (fontFamily !== undefined) restaurant.theme.fontFamily = fontFamily;
  if (themeData.borderRadius !== undefined) restaurant.theme.borderRadius = themeData.borderRadius;

  await restaurant.save();
  return sanitizeRestaurant(restaurant);
}

export async function updateRestaurantSettings(user, settingsData) {
  const restaurant = await getRestaurantDocForUser(user);

  const {
    currency,
    timezone,
    dateFormat,
    language,
    notifications,
    qrPreferences,
    orderPreferences,
    staffPreferences,
    paymentConfig,
    taxRate,
    taxNumber,
    restaurantName,
    description,
    address,
    phone,
    email,
  } = settingsData;

  if (restaurantName !== undefined) restaurant.restaurantName = restaurantName;
  if (description !== undefined) restaurant.description = description;
  if (address !== undefined) restaurant.address = address;
  if (phone !== undefined) restaurant.phone = phone;
  if (email !== undefined) restaurant.email = email;
  if (taxRate !== undefined) restaurant.taxRate = taxRate;
  if (taxNumber !== undefined) restaurant.taxNumber = taxNumber;
  if (currency !== undefined) restaurant.settings.currency = currency;
  if (timezone !== undefined) restaurant.settings.timezone = timezone;
  if (dateFormat !== undefined) restaurant.settings.dateFormat = dateFormat;
  if (language !== undefined) restaurant.settings.language = language;
  if (notifications !== undefined) {
    restaurant.settings.notifications = {
      ...restaurant.settings.notifications?.toObject?.() ?? restaurant.settings.notifications,
      ...notifications,
    };
  }
  if (qrPreferences !== undefined) {
    restaurant.settings.qrPreferences = {
      ...restaurant.settings.qrPreferences?.toObject?.() ?? restaurant.settings.qrPreferences,
      ...qrPreferences,
    };
  }
  if (orderPreferences !== undefined) {
    restaurant.settings.orderPreferences = {
      ...restaurant.settings.orderPreferences?.toObject?.() ?? restaurant.settings.orderPreferences,
      ...orderPreferences,
    };
  }
  if (staffPreferences !== undefined) {
    restaurant.settings.staffPreferences = {
      ...restaurant.settings.staffPreferences?.toObject?.() ?? restaurant.settings.staffPreferences,
      ...staffPreferences,
    };
  }
  if (paymentConfig !== undefined) {
    restaurant.settings.paymentConfig = {
      ...restaurant.settings.paymentConfig?.toObject?.() ?? restaurant.settings.paymentConfig,
      ...paymentConfig,
    };
  }

  await restaurant.save();
  return sanitizeRestaurant(restaurant);
}

function maskKeyId(keyId) {
  if (!keyId) return "";
  if (keyId.length <= 8) return "****";
  return `${keyId.substring(0, 8)}...${keyId.substring(keyId.length - 4)}`;
}

export async function getRestaurantPaymentSettings(user, baseUrl) {
  const restaurant = await getRestaurantDocForUser(user);
  const settings = restaurant.paymentSettings || {};

  return {
    provider: settings.provider || null,
    keyId: settings.keyId ? maskKeyId(settings.keyId) : "",
    paymentsEnabled: settings.paymentsEnabled || false,
    isConnected: !!(settings.keyId && settings.encryptedKeySecret),
    connectedAt: settings.connectedAt || null,
    webhookUrl: `${baseUrl}/payments/webhook`
  };
}

export async function saveRestaurantPaymentSettings(user, payload) {
  const restaurant = await getRestaurantDocForUser(user);
  const { provider, keyId, keySecret, webhookSecret, paymentsEnabled } = payload;

  if (!restaurant.paymentSettings) {
    restaurant.paymentSettings = {
      provider: null,
      paymentsEnabled: false,
    };
  }

  if (provider !== undefined) {
    restaurant.paymentSettings.provider = provider;
  }

  if (keyId !== undefined) {
    const trimmed = keyId.trim();
    if (trimmed && !trimmed.includes("...")) {
      restaurant.paymentSettings.keyId = trimmed;
    }
  }

  if (keySecret !== undefined) {
    const trimmed = keySecret.trim();
    if (trimmed && !trimmed.includes("••••")) {
      restaurant.paymentSettings.encryptedKeySecret = encrypt(trimmed);
      restaurant.paymentSettings.connectedAt = new Date();
    }
  }

  if (webhookSecret !== undefined) {
    const trimmed = webhookSecret.trim();
    if (trimmed && !trimmed.includes("••••")) {
      restaurant.paymentSettings.encryptedWebhookSecret = encrypt(trimmed);
    }
  }

  if (paymentsEnabled !== undefined) {
    restaurant.paymentSettings.paymentsEnabled = paymentsEnabled;
  }

  await restaurant.save();
  return restaurant;
}

export async function testRestaurantPaymentSettings(user, payload) {
  const restaurant = await getRestaurantDocForUser(user);
  let testKeyId = payload.keyId;
  let testKeySecret = payload.keySecret;

  const savedKeyId = restaurant.paymentSettings?.keyId;
  if (!testKeyId || (savedKeyId && testKeyId === maskKeyId(savedKeyId))) {
    testKeyId = savedKeyId;
  }

  if (!testKeySecret && restaurant.paymentSettings?.encryptedKeySecret) {
    testKeySecret = decrypt(restaurant.paymentSettings.encryptedKeySecret);
  }

  if (!testKeyId || !testKeySecret) {
    throw new AppError("Key ID and Key Secret are required to test connection", 400);
  }

  try {
    const rzp = new Razorpay({
      key_id: testKeyId,
      key_secret: testKeySecret,
    });

    await rzp.orders.all({ count: 1 });
    return { success: true, message: "Connected" };
  } catch (err) {
    console.error("Razorpay test connection error:", err);
    throw new AppError(err.message || "Invalid credentials", 400);
  }
}
