import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { CategoryAccordion } from "@/components/customer/CategoryAccordion";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { PopularStrip } from "@/components/customer/PopularStrip";
import { ApiError } from "@/lib/api/client";
import { getPublicMenuApi, getPublicRestaurantApi } from "@/lib/api/public.api";
import type { MenuItemRecord } from "@/lib/types/menu";
import { useFavorites, useRecent } from "@/lib/personalization";
import { applyThemeToElement } from "@/lib/restaurantTheme";
import { Loader2 } from "lucide-react";
import { setContext } from "@/lib/tableContext";

const searchSchema = z.object({
  slug: z.string().optional(),
  table: z.string().optional(),
  room: z.string().optional(),
  takeaway: z.literal("true").optional(),
  qr: z.string().optional(),
});

export const Route = createFileRoute("/customer/menu")({
  validateSearch: searchSchema,
  component: MenuPage,
});

function MenuPage() {
  const { slug: searchSlug, qr } = Route.useSearch();
  const slug = searchSlug ?? "";
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const recent = useRecent();
  const { list: favs } = useFavorites();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug || !qr) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load restaurant theme first
        const { restaurant } = await getPublicRestaurantApi(slug, qr);
        if (!cancelled) {
          if (restaurant.theme) {
            applyThemeToElement(document.documentElement, restaurant.theme);
          }
          setContext({
            qrCodeId: restaurant.qrCodeId,
            type: restaurant.orderContext.type,
            tableId: restaurant.orderContext.tableId,
            roomId: restaurant.orderContext.roomId,
          });

          // These values come from the current QR URL's validated public
          // lookup, not a previously visited restaurant or a client fallback.
          localStorage.setItem("pp_customer_restaurant_id", restaurant.id);
          localStorage.setItem("pp_customer_restaurant_info", JSON.stringify(restaurant));
        }

        // Then load menu items
        const { items: menuItems } = await getPublicMenuApi(slug, qr);
        if (!cancelled) setItems(menuItems);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : "Could not load menu");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, qr]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((m) => m.category)))],
    [items],
  );

  const filtered = items.filter(
    (m) =>
      (active === "All" || m.category === active) &&
      (search === "" || m.name.toLowerCase().includes(search.toLowerCase())),
  );

  const popularItems = items.filter((m) => m.popular);
  const favoriteItems = items.filter((m) => favs.includes(m.id));
  const recentItems = items.filter((m) => recent.includes(m.id));

  if (!slug || !qr) {
    return (
      <CustomerLayout title="Menu">
        <div className="px-6 py-16 text-center text-sm text-muted-foreground">
          Open a restaurant QR link first to browse its digital menu.
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout showSearch search={search} onSearchChange={setSearch}>
      <CategoryAccordion categories={categories} active={active} onChange={setActive} />

      {loading ? (
        <div className="flex justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading menu...
        </div>
      ) : (
        <>
          {search === "" && active === "All" && (
            <>
              <PopularStrip title="Popular now" items={popularItems} />
              {favoriteItems.length > 0 && (
                <PopularStrip title="Your favorites" items={favoriteItems} />
              )}
              {recentItems.length > 0 && (
                <PopularStrip title="Recently ordered" items={recentItems} />
              )}
            </>
          )}

          <div className="space-y-3 px-4 py-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
                No dishes match your search.
              </div>
            ) : (
              filtered.map((item) => <MenuItemCard key={item.id} item={item} />)
            )}
          </div>
        </>
      )}
    </CustomerLayout>
  );
}
