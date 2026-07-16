import { apiRequest } from "./client";
import type { MenuFileType } from "./restaurant.api";
import type { MenuItemRecord } from "@/lib/types/menu";

export type PublicRestaurant = {
  id: string;
  restaurantName: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  menuFileUrl: string | null;
  menuFileType: MenuFileType | null;
  menuMode: "DOCUMENT" | "DIGITAL";
  slug: string;
  qrCodeId: string;
  orderContext: { type: "TABLE" | "ROOM" | "TAKEAWAY" | "RESTAURANT"; tableId?: string; roomId?: string };
  onlinePaymentsEnabled?: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    mode: "light" | "dark";
    fontFamily: string;
  };
  settings: {
    currency: string;
    language: "en" | "hi";
    dateFormat?: string;
    timezone?: string;
  };
};

export type PublicCategory = {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
};

export function getPublicRestaurantApi(slug: string, qrCodeId: string) {
  return apiRequest<{ restaurant: PublicRestaurant }>(`/public/restaurant/${slug}?qr=${encodeURIComponent(qrCodeId)}`);
}

export function recordScanApi(slug: string) {
  return apiRequest<{ scans: number; lastScannedAt: string }>(
    `/public/restaurant/${slug}/scan`,
    { method: "POST" },
  );
}

export function getPublicCategoriesApi(slug: string, qrCodeId: string) {
  return apiRequest<{ categories: PublicCategory[] }>(`/public/restaurant/${slug}/categories?qr=${encodeURIComponent(qrCodeId)}`);
}

export function getPublicMenuApi(slug: string, qrCodeId: string) {
  return apiRequest<{ items: MenuItemRecord[] }>(`/public/restaurant/${slug}/menu?qr=${encodeURIComponent(qrCodeId)}`);
}

export function getPublicMenuItemApi(id: string, qrCodeId: string) {
  return apiRequest<{ item: MenuItemRecord }>(`/public/menu-item/${id}?qr=${encodeURIComponent(qrCodeId)}`);
}
