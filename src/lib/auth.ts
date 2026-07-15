import {
  forgotPasswordApi,
  getMeApi,
  loginApi,
  registerApi,
  resetPasswordApi,
  type AuthUser,
} from "@/lib/api/auth.api";
import { setRole } from "@/lib/roles";
import { getMyRestaurantApi } from "@/lib/api/restaurant.api";

export type { AuthUser } from "@/lib/api/auth.api";

const TOKEN_KEY = "pp_auth_token";
const USER_KEY = "pp_user";

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Role is now sourced from user data, not separate localStorage
  window.dispatchEvent(new Event("pp:auth"));
}

function persistSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  writeUser(user);
}

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    return readUser();
  },

  isAuthed(): boolean {
    return !!this.getToken();
  },

  isOnboarded(): boolean {
    return readUser()?.isOnboarded ?? false;
  },

  setSession(token: string, user: AuthUser) {
    persistSession(token, user);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("pp:auth"));
  },

  updateUser(user: AuthUser) {
    writeUser(user);
  },

  async login(email: string, password: string) {
    const { token, user } = await loginApi({ email, password });
    persistSession(token, user);
    
    // Load and set owner restaurant ID for dashboard access (only for onboarded owners)
    if (user.role === "OWNER" && user.isOnboarded) {
      try {
        const { restaurant } = await getMyRestaurantApi(token);
        if (restaurant?.id) {
          localStorage.setItem("pp_owner_restaurant_id", restaurant.id);
        }
      } catch (error) {
        console.error("Failed to load restaurant on login:", error);
      }
    }
    
    return user;
  },

  async register(name: string, email: string, password: string) {
    const { token, user } = await registerApi({ name, email, password });
    persistSession(token, user);
    return user;
  },

  async loadOwnerRestaurant() {
    const token = this.getToken();
    if (!token) return;
    
    try {
      const { restaurant } = await getMyRestaurantApi(token);
      if (restaurant?.id) {
        localStorage.setItem("pp_owner_restaurant_id", restaurant.id);
      }
    } catch (error) {
      console.error("Failed to load owner restaurant:", error);
    }
  },

  async forgotPassword(email: string) {
    const { message } = await forgotPasswordApi(email);
    return message;
  },

  async resetPassword(token: string, password: string) {
    const { token: jwt, user } = await resetPasswordApi({ token, password });
    persistSession(jwt, user);
    return user;
  },

  async refreshSession() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    const { user } = await getMeApi(token);
    persistSession(token, user);
    
    // Load and set owner restaurant ID for dashboard access (only for onboarded owners)
    if (user.role === "OWNER" && user.isOnboarded) {
      try {
        const { restaurant } = await getMyRestaurantApi(token);
        if (restaurant?.id) {
          localStorage.setItem("pp_owner_restaurant_id", restaurant.id);
        }
      } catch (error) {
        console.error("Failed to load restaurant on refresh:", error);
      }
    }
    
    return user;
  },
};
