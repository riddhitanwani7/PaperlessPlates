import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { auth } from "@/lib/auth";
import { getMyRestaurantApi, type Restaurant } from "@/lib/api/restaurant.api";
import { setAppLanguage, type AppLanguage } from "@/i18n";

type RestaurantContextValue = {
  restaurant: Restaurant | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setLanguage: (lang: AppLanguage) => void;
};

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setAppLanguage(lang);
  }, []);

  const refresh = useCallback(async () => {
    const token = auth.getToken();
    const user = auth.getUser();
    
    if (!token) {
      setRestaurant(null);
      setLoading(false);
      return;
    }
    
    // SUPER_ADMIN doesn't have a restaurant, skip loading
    if (user?.role === "SUPER_ADMIN") {
      setRestaurant(null);
      setLoading(false);
      return;
    }
    
    try {
      const { restaurant: data } = await getMyRestaurantApi(token);
      setRestaurant(data);
      if (data?.settings?.language) setAppLanguage(data.settings.language);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onAuth = () => void refresh();
    window.addEventListener("pp:auth", onAuth);
    window.addEventListener("pp:restaurant-updated", onAuth);
    return () => {
      window.removeEventListener("pp:auth", onAuth);
      window.removeEventListener("pp:restaurant-updated", onAuth);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ restaurant, loading, refresh, setLanguage }),
    [restaurant, loading, refresh, setLanguage],
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
}

export function notifyRestaurantUpdated() {
  window.dispatchEvent(new Event("pp:restaurant-updated"));
}
