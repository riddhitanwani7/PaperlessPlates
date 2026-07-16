import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { OrderHistoryCard } from "@/components/customer/OrderHistoryCard";
import { Loader2 } from "lucide-react";
import { getCustomerSessionId } from "@/lib/customerSession";
import { getContext, getContextLabel } from "@/lib/tableContext";
import { getCustomerOrdersByContextApi, type Order } from "@/lib/api/order.api";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [contextLabel, setContextLabel] = useState<string>("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const customerSessionId = getCustomerSessionId();
        if (!customerSessionId) {
          setLoading(false);
          return;
        }

        const context = getContext();
        if (!context?.qrCodeId) {
          toast.error("Invalid or expired ordering link. Please scan the QR code again.");
          setLoading(false);
          return;
        }

        // Set context label for UI
        setContextLabel(getContextLabel());

        // Fetch orders by context with restaurant isolation
        const { orders: orderData } = await getCustomerOrdersByContextApi(customerSessionId, { qrCodeId: context.qrCodeId });
        setOrders(orderData);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load order history");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();

    // Re-fetch when context changes
    const handleContextChange = () => {
      fetchOrders();
    };
    window.addEventListener("pp:context", handleContextChange);
    return () => {
      window.removeEventListener("pp:context", handleContextChange);
    };
  }, []);

  return (
    <CustomerLayout title="Order History">
      {/* Context Badge */}
      {contextLabel && (
        <div className="px-4 py-3">
          <div className="rounded-full bg-primary-soft px-4 py-2 text-center text-sm font-medium text-primary">
            Viewing orders for {contextLabel}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading history...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-primary">
            <Loader2 className="h-12 w-12" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold">No Orders Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 px-4 py-4">
          {orders.map((order) => (
            <OrderHistoryCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
