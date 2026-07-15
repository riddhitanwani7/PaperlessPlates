import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Utensils, ShoppingBag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

const navItems = [
  { id: "menu", labelKey: "customer.menu", icon: Utensils, to: "/customer/menu" },
  { id: "cart", labelKey: "customer.cart", icon: ShoppingBag, to: "/customer/cart" },
  { id: "history", labelKey: "customer.history", icon: Clock, to: "/customer/history" },
] as const;

export function CustomerBottomNav() {
  const { t } = useTranslation();
  const { count } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const hideNav =
    pathname.startsWith("/customer/checkout") ||
    pathname.startsWith("/customer/payment") ||
    pathname.startsWith("/customer/order-confirmation");

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <div className="mx-4 mb-4 rounded-t-2xl rounded-b-lg border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.id === "cart" && count > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
