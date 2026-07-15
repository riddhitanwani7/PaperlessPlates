import { API_BASE_URL } from "./config";
import { apiRequestAuth, authHeaders, ApiError } from "./client";
import type { MenuItemRecord } from "@/lib/types/menu";

export function listMenuItemsApi(token: string, categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  return apiRequestAuth<{ items: MenuItemRecord[] }>(`/menu-items${query}`, token);
}

async function uploadMenuItemRequest<T>(
  path: string,
  token: string,
  formData: FormData,
  method: "POST" | "PUT",
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: authHeaders(token),
    body: formData,
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new ApiError(body.message ?? "Request failed", response.status);
  }

  return body.data as T;
}

export function createMenuItemApi(token: string, formData: FormData) {
  return uploadMenuItemRequest<{ item: MenuItemRecord }>("/menu-items", token, formData, "POST");
}

export function updateMenuItemApi(token: string, id: string, formData: FormData) {
  return uploadMenuItemRequest<{ item: MenuItemRecord }>(
    `/menu-items/${id}`,
    token,
    formData,
    "PUT",
  );
}

export function deleteMenuItemApi(token: string, id: string) {
  return apiRequestAuth<{ message: string }>(`/menu-items/${id}`, token, {
    method: "DELETE",
  });
}

export function getMenuItemApi(token: string, id: string) {
  return apiRequestAuth<{ item: MenuItemRecord }>(`/menu-items/${id}`, token);
}
