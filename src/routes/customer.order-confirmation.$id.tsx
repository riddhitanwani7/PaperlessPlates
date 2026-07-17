import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getCustomerOrderConfirmationApi, type Order } from "@/lib/api/order.api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { getCustomerSessionId } from "@/lib/customerSession";
import { getContext } from "@/lib/tableContext";

export const Route = createFileRoute("/customer/order-confirmation/$id")({
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
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
    async function fetchOrder() {
      try {
        const customerSessionId = getCustomerSessionId();
        const qrCodeId = getContext()?.qrCodeId;
        if (!customerSessionId || !qrCodeId) throw new Error("Missing ordering context");
        const { order: orderData } = await getCustomerOrderConfirmationApi(
          customerSessionId,
          id,
          qrCodeId,
        );
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        // If orderNumber lookup fails, show the ID from URL
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <CustomerLayout title="Order confirmed">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  const orderNumber = order?.orderNumber || id;
  const orderType = order?.orderType;
  const tableLabel = order?.tableId
    ? `Table ${order.tableId}`
    : order?.roomId
      ? `Room ${order.roomId}`
      : orderType === "TAKEAWAY"
        ? "Takeaway"
        : "";

  return (
    <CustomerLayout title="Order confirmed">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-2xl">Thank you!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your order <span className="font-medium text-foreground">{orderNumber}</span> has been
          received.
        </p>
      </div>

      {order && (
        <div className="mx-4 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            <p className="text-muted-foreground">Order type</p>
            <p className="font-display text-lg font-semibold">{orderType}</p>
          </div>

          {tableLabel && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm">
              <p className="text-muted-foreground">Location</p>
              <p className="font-display text-lg font-semibold">{tableLabel}</p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            <p className="text-muted-foreground">Total amount</p>
            <p className="font-display text-2xl font-semibold">
              {formatCurrency(order.total, currency)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            <p className="text-muted-foreground">Estimated preparation</p>
            <p className="font-display text-2xl">15–20 minutes</p>
          </div>
        </div>
      )}

      <div className="space-y-2 p-4">
        <Button asChild size="lg" className="h-12 w-full rounded-full bg-primary">
          <Link to="/customer/order-tracking/$id" params={{ id: orderNumber }}>
            Track order
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11 w-full rounded-full">
          <Link to="/customer/menu">Order more</Link>
        </Button>
      </div>
    </CustomerLayout>
  );
}
