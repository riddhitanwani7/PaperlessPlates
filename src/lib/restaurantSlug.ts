const RESTAURANT_SLUG_KEY = "pp_customer_restaurant_slug";
const CUSTOMER_RESTAURANT_ID_KEY = "pp_customer_restaurant_id";

export function getRestaurantSlug(searchSlug?: string) {
  if (searchSlug) return searchSlug;
  if (typeof window === "undefined") return "";
  return localStorage.getItem(RESTAURANT_SLUG_KEY) ?? "";
}

export function setRestaurantSlug(slug: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESTAURANT_SLUG_KEY, slug);
}

export function getCustomerRestaurantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_RESTAURANT_ID_KEY);
}

export function setCustomerRestaurantId(restaurantId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_RESTAURANT_ID_KEY, restaurantId);
}
