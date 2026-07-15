import { apiRequestAuth } from "./client";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "KITCHEN" | "WAITER";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type AddStaffInput = {
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "KITCHEN" | "WAITER";
  password?: string;
};

export function getStaffApi(token: string) {
  return apiRequestAuth<StaffMember[]>("/staff", token);
}

export function addStaffApi(token: string, data: AddStaffInput) {
  return apiRequestAuth<StaffMember & { temporaryPassword: string }>("/staff", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStaffRoleApi(token: string, staffId: string, role: string) {
  return apiRequestAuth<StaffMember>(`/staff/${staffId}/role`, token, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function deactivateStaffApi(token: string, staffId: string) {
  return apiRequestAuth<StaffMember>(`/staff/${staffId}/deactivate`, token, {
    method: "PATCH",
  });
}

export function activateStaffApi(token: string, staffId: string) {
  return apiRequestAuth<StaffMember>(`/staff/${staffId}/activate`, token, {
    method: "PATCH",
  });
}
