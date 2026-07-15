import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { CartLineItem } from "@/components/customer/CartLineItem";
import { OrderSummary } from "@/components/customer/OrderSummary";
import { useCart } from "@/lib/cart";
import { clearTableContext } from "@/lib/tableContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/customer/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, tax, total, setQty, remove, setNotes } = useCart();
  const navigate = useNavigate();
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

  if (items.length === 0) {
    return (
      <CustomerLayout showBack title="Your cart">
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-primary">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold">Your Cart is Empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">Browse the menu and add items.</p>
          <Button asChild className="mt-8 h-12 rounded-full bg-primary px-8 text-base">
            <Link to="/customer/menu">Browse Menu</Link>
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout showBack title="Your cart">
      <div className="space-y-3 p-4">
        {items.map((it) => (
          <CartLineItem
            key={it.id}
            item={it}
            onQty={(q) => setQty(it.id, q)}
            onRemove={() => remove(it.id)}
            onNotes={(n) => setNotes(it.id, n)}
            currency={currency}
          />
        ))}
        <OrderSummary subtotal={subtotal} tax={tax} total={total} currency={currency} />
      </div>
      <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-primary text-base shadow-lg shadow-primary/30"
          onClick={() => {
  navigate({ to: "/customer/checkout" });
}}
        >
          Proceed to checkout
        </Button>
      </div>
    </CustomerLayout>
  );
}
