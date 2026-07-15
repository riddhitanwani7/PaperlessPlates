import { type ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerBottomNav } from "./CustomerBottomNav";
import { RESTAURANT } from "@/lib/mock";

export function CustomerLayout({
  children,
  showSearch = false,
  search,
  onSearchChange,
  showBack = false,
  title,
}: {
  children: ReactNode;
  showSearch?: boolean;
  search?: string;
  onSearchChange?: (v: string) => void;
  showBack?: boolean;
  title?: string;
}) {
  const { t } = useTranslation();
  
  // Get restaurant info from localStorage (set by restaurant.$slug.tsx)
  const getRestaurantInfo = () => {
    try {
      const stored = localStorage.getItem("pp_customer_restaurant_info");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  };
  
  const restaurantInfo = getRestaurantInfo();
  const restaurantName = restaurantInfo?.restaurantName ?? RESTAURANT.name;
  const tagline = restaurantInfo?.description || RESTAURANT.tagline;
  const logoUrl = restaurantInfo?.logoUrl;
  const primaryColor = restaurantInfo?.theme?.primaryColor;
  const fontFamily = restaurantInfo?.theme?.fontFamily;

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background shadow-xl">
        {/* Brand header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3">
            {showBack ? (
              <Link
                to="/customer/menu"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground/70 hover:bg-muted"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : (
              logoUrl ? (
                <img
                  src={logoUrl}
                  alt={restaurantName}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg text-sm font-bold text-white"
                  style={{ background: primaryColor ?? undefined }}
                >
                  {restaurantName.charAt(0).toUpperCase()}
                </div>
              )
            )}
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-display text-base leading-tight"
                style={{ fontFamily: fontFamily ?? undefined }}
              >
                {title ?? restaurantName}
              </p>
              {!title && (
                <p className="truncate text-xs text-muted-foreground">{tagline}</p>
              )}
            </div>
          </div>
          {showSearch && (
            <div className="relative px-4 pb-3">
              <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={t("customer.searchPlaceholder")}
                className="pl-9 h-12 rounded-full"
              />
            </div>
          )}
        </header>

        <main className="flex-1">{children}</main>

        <CustomerBottomNav />
        <div className="h-24" />
      </div>
    </div>
  );
}

export function CustomerSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Convenient controlled search hook for menu page
export function useSearch(initial = "") {
  return useState(initial);
}
