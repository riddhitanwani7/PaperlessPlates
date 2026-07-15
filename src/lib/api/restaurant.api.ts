import { apiRequestAuth, apiUploadAuth } from "./client";
import type { AuthUser } from "./auth.api";

export type MenuFileType = "pdf" | "jpg" | "jpeg" | "png";

export type BusinessHoursDay = {
  open: string;
  close: string;
  closed: boolean;
};

export type BusinessHours = {
  monday: BusinessHoursDay;
  tuesday: BusinessHoursDay;
  wednesday: BusinessHoursDay;
  thursday: BusinessHoursDay;
  friday: BusinessHoursDay;
  saturday: BusinessHoursDay;
  sunday: BusinessHoursDay;
};

export type SocialMedia = {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
};

export type RestaurantTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mode: "light" | "dark";
  fontFamily: string;
  borderRadius?: string;
};

export type RestaurantSettings = {
  currency: string;
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  language: "en" | "hi";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    newOrders: boolean;
    kitchenAlerts: boolean;
    waiterAlerts: boolean;
    dailySummary: boolean;
    weeklyAnalytics: boolean;
    productUpdates: boolean;
  };
  qrPreferences: {
    autoGenerate: boolean;
    qrSize: "small" | "medium" | "large";
    showLogoOnQr: boolean;
  };
  orderPreferences: {
    autoConfirm: boolean;
    preparationTime: number;
    allowCustomerNotes: boolean;
    acceptTableOrders: boolean;
    acceptRoomOrders: boolean;
    acceptRestaurantOrders: boolean;
    acceptTakeawayOrders: boolean;
    requirePaymentBeforePreparation: boolean;
  };
  staffPreferences: {
    requireShiftCheckIn: boolean;
    allowWaiterOrderCancel: boolean;
  };
  paymentConfig: {
    enabled: boolean;
    provider: "razorpay" | "stripe" | "cashfree" | null;
    testMode: boolean;
    acceptCash: boolean;
    acceptUpi: boolean;
  };
};

export type Restaurant = {
  id: string;
  ownerId: string;
  restaurantName?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  businessType?: "restaurant" | "cafe" | "hotel" | "bar" | "cloud";
  cuisine?: string;
  selectedPlan?: string;
  qrEnabled: boolean;
  onboardingCompleted: boolean;
  menuFileUrl?: string;
  menuFileType?: MenuFileType;
  menuUploadedAt?: string;
  menuMode?: "DOCUMENT" | "DIGITAL";
  businessHours?: BusinessHours;
  taxRate?: number;
  taxNumber?: string;
  socialMedia?: SocialMedia;
  deliveryEnabled?: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
  minOrderAmount?: number;
  theme?: RestaurantTheme;
  settings?: RestaurantSettings;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantMenu = {
  menuFileUrl: string;
  menuFileType: MenuFileType;
  menuUploadedAt: string;
};

export type OnboardingPayload = {
  restaurantName?: string;
  address?: string;
  phone?: string;
  businessType?: Restaurant["businessType"];
  qrEnabled?: boolean;
};

export type ProfileUpdatePayload = {
  restaurantName?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  businessType?: Restaurant["businessType"];
  cuisine?: string;
  businessHours?: BusinessHours;
  taxRate?: number;
  taxNumber?: string;
  socialMedia?: SocialMedia;
  deliveryEnabled?: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
  minOrderAmount?: number;
};

export type ThemeUpdatePayload = Partial<RestaurantTheme>;

export type SettingsUpdatePayload = Partial<RestaurantSettings> & {
  taxRate?: number;
  taxNumber?: string;
  restaurantName?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export const CUISINE_OPTIONS = [
  { value: "indian", label: "Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "italian", label: "Italian" },
  { value: "mexican", label: "Mexican" },
  { value: "american", label: "American" },
  { value: "japanese", label: "Japanese" },
  { value: "thai", label: "Thai" },
  { value: "french", label: "French" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "other", label: "Other" },
] as const;

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: "09:00", close: "22:00", closed: false },
  tuesday: { open: "09:00", close: "22:00", closed: false },
  wednesday: { open: "09:00", close: "22:00", closed: false },
  thursday: { open: "09:00", close: "22:00", closed: false },
  friday: { open: "09:00", close: "22:00", closed: false },
  saturday: { open: "09:00", close: "23:00", closed: false },
  sunday: { open: "10:00", close: "22:00", closed: false },
};

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const DAY_LABELS: Record<(typeof DAY_KEYS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export { DAY_KEYS };

export function getMyRestaurantApi(token: string) {
  return apiRequestAuth<{ restaurant: Restaurant | null }>("/restaurants/me", token);
}

export function saveOnboardingApi(token: string, payload: OnboardingPayload) {
  return apiRequestAuth<{ restaurant: Restaurant }>("/restaurants/onboarding", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeOnboardingApi(token: string) {
  return apiRequestAuth<{ restaurant: Restaurant; user: AuthUser }>(
    "/restaurants/onboarding/complete",
    token,
    { method: "PATCH" },
  );
}

export function getMyMenuApi(token: string) {
  return apiRequestAuth<{ menu: RestaurantMenu | null }>("/restaurants/me/menu", token);
}

export function uploadMenuApi(token: string, file: File) {
  const formData = new FormData();
  formData.append("menu", file);
  return apiUploadAuth<{ menu: RestaurantMenu }>("/restaurants/menu/upload", token, formData);
}

export function deleteMenuApi(token: string) {
  return apiRequestAuth<{ message: string }>("/restaurants/me/menu", token, {
    method: "DELETE",
  });
}

export function updateProfileApi(token: string, payload: ProfileUpdatePayload) {
  return apiRequestAuth<{ restaurant: Restaurant }>("/restaurants/me/profile", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadLogoApi(token: string, file: File) {
  const formData = new FormData();
  formData.append("logo", file);
  return apiUploadAuth<{ restaurant: Restaurant }>("/restaurants/me/logo", token, formData);
}

export function uploadCoverApi(token: string, file: File) {
  const formData = new FormData();
  formData.append("cover", file);
  return apiUploadAuth<{ restaurant: Restaurant }>("/restaurants/me/cover", token, formData);
}

export function updateThemeApi(token: string, payload: ThemeUpdatePayload) {
  return apiRequestAuth<{ restaurant: Restaurant }>("/restaurants/me/theme", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateSettingsApi(token: string, payload: SettingsUpdatePayload) {
  return apiRequestAuth<{ restaurant: Restaurant }>("/restaurants/me/settings", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export interface PaymentSettingsPayload {
  provider: "razorpay" | null;
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
  paymentsEnabled?: boolean;
}

export interface PaymentSettingsResponse {
  provider: "razorpay" | null;
  keyId: string;
  paymentsEnabled: boolean;
  isConnected: boolean;
  connectedAt: string | null;
  webhookUrl: string;
}

export function getPaymentSettingsApi(token: string) {
  return apiRequestAuth<PaymentSettingsResponse>("/restaurants/me/payment-settings", token);
}

export function savePaymentSettingsApi(token: string, payload: PaymentSettingsPayload) {
  return apiRequestAuth<PaymentSettingsResponse>("/restaurants/me/payment-settings", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function testPaymentSettingsConnectionApi(token: string, payload: { keyId?: string; keySecret?: string }) {
  return apiRequestAuth<{ message: string }>("/restaurants/me/payment-settings/test", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
