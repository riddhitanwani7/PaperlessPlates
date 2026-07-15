import mongoose from "mongoose";
import { ALL_PLAN_IDS } from "../config/plans.js";

const BUSINESS_TYPES = ["restaurant", "cafe", "hotel", "bar", "cloud"];
const PLANS = ALL_PLAN_IDS;
const CUISINE_TYPES = ["indian", "chinese", "italian", "mexican", "american", "japanese", "thai", "french", "mediterranean", "other"];

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    restaurantName: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    logoPublicId: {
      type: String,
      trim: true,
    },
    coverImageUrl: {
      type: String,
      trim: true,
    },
    coverImagePublicId: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    businessType: {
      type: String,
      enum: BUSINESS_TYPES,
    },
    cuisine: {
      type: String,
      enum: CUISINE_TYPES,
    },
    selectedPlan: {
      type: String,
      enum: PLANS,
      default: "STARTER",
    },
    qrEnabled: {
      type: Boolean,
      default: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    menuFileUrl: {
      type: String,
      trim: true,
    },
    menuFilePublicId: {
      type: String,
      trim: true,
    },
    menuFileType: {
      type: String,
      enum: ["pdf", "jpg", "jpeg", "png"],
    },
    menuUploadedAt: {
      type: Date,
    },
    menuMode: {
      type: String,
      enum: ["DOCUMENT", "DIGITAL"],
      default: "DOCUMENT",
    },
    // Business hours
    businessHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
    },
    // Tax information
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxNumber: {
      type: String,
      trim: true,
    },
    // Social media links
    socialMedia: {
      website: { type: String, trim: true },
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
    // Delivery/service settings
    deliveryEnabled: {
      type: Boolean,
      default: false,
    },
    deliveryRadius: {
      type: Number,
      default: 5,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Theme customization
    theme: {
      primaryColor: { type: String, default: "#f97316" },
      secondaryColor: { type: String, default: "#1e293b" },
      accentColor: { type: String, default: "#f97316" },
      mode: { type: String, enum: ["light", "dark"], default: "light" },
      fontFamily: { type: String, default: "Inter" },
      borderRadius: { type: String, default: "0.875rem" },
    },
    // Settings
    settings: {
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      dateFormat: { type: String, enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], default: "DD/MM/YYYY" },
      language: { type: String, enum: ["en", "hi"], default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        newOrders: { type: Boolean, default: true },
        kitchenAlerts: { type: Boolean, default: true },
        waiterAlerts: { type: Boolean, default: true },
        dailySummary: { type: Boolean, default: true },
        weeklyAnalytics: { type: Boolean, default: true },
        productUpdates: { type: Boolean, default: false },
      },
      qrPreferences: {
        autoGenerate: { type: Boolean, default: true },
        qrSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
        showLogoOnQr: { type: Boolean, default: true },
      },
      orderPreferences: {
        autoConfirm: { type: Boolean, default: false },
        preparationTime: { type: Number, default: 15 },
        allowCustomerNotes: { type: Boolean, default: true },
        acceptTableOrders: { type: Boolean, default: true },
        acceptRoomOrders: { type: Boolean, default: true },
        acceptRestaurantOrders: { type: Boolean, default: true },
        acceptTakeawayOrders: { type: Boolean, default: true },
        requirePaymentBeforePreparation: { type: Boolean, default: false },
      },
      staffPreferences: {
        requireShiftCheckIn: { type: Boolean, default: false },
        allowWaiterOrderCancel: { type: Boolean, default: false },
      },
      paymentConfig: {
        enabled: { type: Boolean, default: false },
        provider: { type: String, enum: ["razorpay", "stripe", "cashfree", null], default: null },
        testMode: { type: Boolean, default: true },
        acceptCash: { type: Boolean, default: true },
        acceptUpi: { type: Boolean, default: false },
      },
    },
    paymentSettings: {
      provider: {
        type: String,
        enum: ["razorpay", null],
        default: null,
      },
      keyId: {
        type: String,
        trim: true,
      },
      encryptedKeySecret: {
        type: String,
        trim: true,
      },
      encryptedWebhookSecret: {
        type: String,
        trim: true,
      },
      paymentsEnabled: {
        type: Boolean,
        default: false,
      },
      connectedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
