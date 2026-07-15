import { apiRequestAuth } from "./client";
import type { MenuCategory } from "@/lib/types/menu";

export function listCategoriesApi(token: string) {
  return apiRequestAuth<{ categories: MenuCategory[] }>("/categories", token);
}

export function createCategoryApi(
  token: string,
  payload: { name: string; description?: string; sortOrder?: number; active?: boolean },
) {
  return apiRequestAuth<{ category: MenuCategory }>("/categories", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategoryApi(
  token: string,
  id: string,
  payload: Partial<{ name: string; description: string; sortOrder: number; active: boolean }>,
) {
  return apiRequestAuth<{ category: MenuCategory }>(`/categories/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCategoryApi(token: string, id: string) {
  return apiRequestAuth<{ message: string }>(`/categories/${id}`, token, {
    method: "DELETE",
  });
}
