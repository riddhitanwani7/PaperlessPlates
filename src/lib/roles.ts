// Role system - role is sourced from authenticated user data
import { useEffect, useState } from "react";
import { auth } from "./auth";

export type Role = "SUPER_ADMIN" | "OWNER" | "MANAGER" | "WAITER" | "KITCHEN";

export const ROLES: Role[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "WAITER", "KITCHEN"];

export function getRole(): Role {
  const user = auth.getUser();
  if (!user) return "OWNER";
  return user.role || "OWNER";
}

export function setRole(role: Role) {
  // Role is now sourced from backend user data, not localStorage
  // This function is kept for compatibility but does nothing
  console.warn("setRole is deprecated - role is sourced from backend user data");
}

export function useRole(): Role {
  const [role, setLocal] = useState<Role>("OWNER");
  useEffect(() => {
    setLocal(getRole());
    const onChange = () => setLocal(getRole());
    window.addEventListener("pp:auth", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("pp:auth", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return role;
}

export function roleHome(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/platform-admin";
    case "OWNER":
      return "/app";
    case "MANAGER":
      return "/app";
    case "KITCHEN":
      return "/app/kitchen";
    case "WAITER":
      return "/app/orders";
    default:
      return "/app";
  }
}

// Route -> allowed roles
export const ROUTE_ROLES: Record<string, Role[]> = {
  "/platform-admin": ["SUPER_ADMIN"],
  "/app": ["OWNER", "MANAGER"],
  "/app/analytics": ["OWNER", "MANAGER"],
  "/app/orders": ["OWNER", "MANAGER", "WAITER", "KITCHEN"],
  "/app/kitchen": ["OWNER", "MANAGER", "KITCHEN"],
  "/app/menu": ["OWNER", "MANAGER"],
  "/app/qr-management": ["OWNER", "MANAGER"],
  "/app/tables": ["OWNER", "MANAGER", "WAITER"],
  "/app/rooms": ["OWNER", "MANAGER", "WAITER"],
  "/app/staff": ["OWNER"],
  "/app/subscription": ["OWNER"],
  "/app/profile": ["OWNER", "MANAGER"],
  "/app/preview": ["OWNER", "MANAGER"],
};

export function canAccess(path: string, role: Role): boolean {
  const allowed = ROUTE_ROLES[path];
  if (!allowed) return false; // If route not defined, deny access
  return allowed.includes(role);
}

export function hasRole(role: Role): boolean {
  return getRole() === role;
}

export function hasAnyRole(...roles: Role[]): boolean {
  const currentRole = getRole();
  return roles.includes(currentRole);
}
