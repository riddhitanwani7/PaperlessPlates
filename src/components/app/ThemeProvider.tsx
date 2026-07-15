import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { RestaurantTheme } from "@/lib/api/restaurant.api";
import { applyThemeToElement } from "@/lib/restaurantTheme";
import { auth } from "@/lib/auth";
import { getMyRestaurantApi } from "@/lib/api/restaurant.api";

interface RestaurantThemeContextValue {
  theme: RestaurantTheme | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const RestaurantThemeContext = createContext<RestaurantThemeContextValue>({
  theme: null,
  loading: true,
  refresh: async () => {},
});

export function RestaurantThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<RestaurantTheme | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTheme = async () => {
    try {
      const token = auth.getToken();
      const user = auth.getUser();
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // SUPER_ADMIN doesn't have a restaurant theme, skip loading
      if (user?.role === "SUPER_ADMIN") {
        setLoading(false);
        return;
      }

      const { restaurant } = await getMyRestaurantApi(token);
      if (restaurant?.theme) {
        setTheme(restaurant.theme);
        applyThemeToElement(document.documentElement, restaurant.theme);
      }
    } catch (error) {
      console.error("Failed to load restaurant theme:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const refresh = async () => {
    setLoading(true);
    await loadTheme();
  };

  return (
    <RestaurantThemeContext.Provider value={{ theme, loading, refresh }}>
      {children}
    </RestaurantThemeContext.Provider>
  );
}

export function useRestaurantTheme() {
  return useContext(RestaurantThemeContext);
}
