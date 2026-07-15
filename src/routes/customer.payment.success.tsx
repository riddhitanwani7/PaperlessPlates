import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { recent } from "@/lib/personalization";
import { CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/customer/payment/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const { total, items, clear } = useCart();
  const navigate = useNavigate();
  const orderId = useMemo(() => `ORD-${Math.floor(Math.random() * 90000) + 10000}`, []);
  const txnId = useMemo(() => `TXN-${Math.floor(Math.random() * 900000) + 100000}`, []);

  useEffect(() => {
    if (items.length > 0) {
      recent.push(items.map((i) => i.id));
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CustomerLayout title="Payment successful">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-2xl">Payment successful</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your order has been placed.</p>
      </div>
      <div className="mx-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-medium">{orderId}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Transaction</span>
          <span className="font-medium">{txnId}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Amount paid</span>
          <span className="font-display text-lg">${(total || 0).toFixed(2)}</span>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-primary"
          onClick={() => navigate({ to: "/customer/order-tracking/$id", params: { id: orderId } })}
        >
          Track order
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11 w-full rounded-full">
          <Link to="/customer/menu"><Download className="mr-2 h-4 w-4" />Download receipt</Link>
        </Button>
      </div>
    </CustomerLayout>
  );
}
