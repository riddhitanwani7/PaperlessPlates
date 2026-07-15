import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { MenuItemRecord } from "@/lib/types/menu";
import { DietaryBadges } from "./DietaryBadges";
import { FavoriteButton } from "./FavoriteButton";
import { cart } from "@/lib/cart";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export function MenuItemCard({ item }: { item: MenuItemRecord }) {
  const { t } = useTranslation();
  
  // Get currency from localStorage
  const getCurrency = () => {
    try {
      const stored = localStorage.getItem("pp_customer_restaurant_info");
      if (stored) {
        const info = JSON.parse(stored);
        return info.settings?.currency ?? "INR";
      }
    } catch {}
    return "INR";
  };
  
  const currency = getCurrency();
  const image = item.image ?? item.imageUrl;
  return (
    <div className="group relative flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <Link
        to="/customer/menu/item/$id"
        params={{ id: item.id }}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {image ? (
          <img src={image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-primary/30" />
        )}
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 text-[10px] font-semibold uppercase">
            Sold out
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/customer/menu/item/$id"
            params={{ id: item.id }}
            className="font-medium leading-tight hover:text-primary"
          >
            {item.name}
          </Link>
          <FavoriteButton id={item.id} />
        </div>
        <p className="line-clamp-2 mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        <div className="mt-1.5"><DietaryBadges tags={item.tags} /></div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="font-display text-lg">{formatCurrency(item.price, currency)}</span>
          <button
            disabled={!item.available}
            onClick={() =>
              cart.add({ id: item.id, name: item.name, price: item.price, image })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-40"
            aria-label={t("customer.addToCart")}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
