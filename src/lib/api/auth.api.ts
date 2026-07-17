import { apiRequest } from "./client";
import type { Role } from "@/lib/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  restaurantId?: string;
  isOnboarded: boolean;
};

type AuthPayload = {
  user: AuthUser;
  token: string;
};

export function registerApi(input: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginApi(input: { email: string; password: string }) {
  return apiRequest<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMeApi(token: string) {
  return apiRequest<{ user: AuthUser }>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
