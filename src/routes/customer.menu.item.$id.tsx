import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { DietaryBadges } from "@/components/customer/DietaryBadges";
import { QuantityStepper } from "@/components/customer/QuantityStepper";
import { FavoriteButton } from "@/components/customer/FavoriteButton";
import { cart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { getPublicMenuItemApi } from "@/lib/api/public.api";
import type { MenuItemRecord } from "@/lib/types/menu";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/customer/menu/item/$id")({
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<MenuItemRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const stored = localStorage.getItem("pp_customer_restaurant_info");
    if (stored) {
      try {
        const info = JSON.parse(stored);
        setCurrency(info.settings?.currency ?? "INR");
      } catch {}
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { item: data } = await getPublicMenuItemApi(id);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : "Item not found");
          setItem(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <CustomerLayout showBack title="Item">
        <div className="flex justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading item...
        </div>
      </CustomerLayout>
    );
  }

  if (!item) {
    return (
      <CustomerLayout showBack title="Item">
        <div className="p-6 text-center text-sm text-muted-foreground">
          Item not found.{" "}
          <Link to="/customer/menu" className="text-primary">
            Back to menu
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const image = item.image ?? item.imageUrl;

  return (
    <CustomerLayout showBack title={item.name}>
      <div className="relative h-64 w-full overflow-hidden bg-muted">
        {image && <img src={image} alt={item.name} className="h-full w-full object-cover" />}
        <div className="absolute right-3 top-3">
          <FavoriteButton id={item.id} size="md" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl">{item.name}</h1>
            <span className="font-display text-2xl text-primary">{formatCurrency(item.price, currency)}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <DietaryBadges tags={item.tags} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="text-sm font-semibold">Special instructions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="No onions, extra spicy, allergies…"
            className="mt-2 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <span className="text-sm font-medium">Quantity</span>
          <QuantityStepper value={qty} onChange={setQty} min={1} size="lg" />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button
          size="lg"
          disabled={!item.available}
          onClick={() => {
            cart.add({
              id: item.id,
              name: item.name,
              price: item.price,
              image,
              qty,
              notes: notes || undefined,
            });
            navigate({ to: "/customer/cart" });
          }}
          className="h-12 w-full rounded-full bg-primary text-base shadow-lg shadow-primary/30"
        >
          Add to cart — {formatCurrency(qty * item.price, currency)}
        </Button>
      </div>
    </CustomerLayout>
  );
}
