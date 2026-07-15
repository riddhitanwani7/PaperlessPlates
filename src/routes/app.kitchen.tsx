import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Button } from "@/components/ui/button";
import { Maximize2, Loader2 } from "lucide-react";
import { getRestaurantOrdersApi, updateOrderStatusApi, type Order } from "@/lib/api/order.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
export const Route = createFileRoute("/app/kitchen")({
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER", "KITCHEN"]}>
      <KitchenPage />
    </RoleGuard>
  ),
});

type OrderStatus = "PENDING" | "ACCEPTED" | "COMPLETED";

const COLUMNS: OrderStatus[] = ["PENDING", "ACCEPTED", "COMPLETED"];
const COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-50 border-yellow-200",
  ACCEPTED: "bg-blue-50 border-blue-200",
  COMPLETED: "bg-muted border-border",
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function getOrderLocation(order: Order): string {
  if (order.orderType === "TABLE" && order.tableId) return `Table ${order.tableId}`;
  if (order.orderType === "ROOM" && order.roomId) return `Room ${order.roomId}`;
  if (order.orderType === "TAKEAWAY") return "Takeaway";
  return "Restaurant";
}

function KitchenPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
      if (!restaurantId) {
        toast.error(t("kitchen.restaurantMissing"));
        setLoading(false);
        return;
      }

      const token = auth.getToken();
    if (!token) {
        toast.error(t("kitchen.notAuthenticated"));
        setLoading(false);
        return;
      }

      const { orders: orderData } = await getRestaurantOrdersApi(restaurantId, token);
      setOrders(orderData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (loading) {
        toast.error(t("kitchen.loadFailed"));
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleAccept(orderId: string) {
    setUpdating(orderId);
    try {
      const token = auth.getToken();
   if (!token) throw new Error("Not authenticated");
      await updateOrderStatusApi(orderId, "ACCEPTED", token);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "ACCEPTED" } : o)));
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast.error(t("kitchen.acceptFailed"));
    } finally {
      setUpdating(null);
    }
  }

  async function handleComplete(orderId: string) {
    setUpdating(orderId);
    try {
      const token = auth.getToken();
      if (!token) throw new Error("Not authenticated");
      await updateOrderStatusApi(orderId, "COMPLETED", token);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "COMPLETED" } : o)));
    } catch (error) {
      console.error("Failed to complete order:", error);
      toast.error(t("kitchen.completeFailed"));
    } finally {
      setUpdating(null);
    }
  }

  function fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader
        title={t("kitchen.title")}
        description={t("kitchen.description")}
        actions={
          <Button variant="outline" onClick={fullscreen}>
            <Maximize2 className="mr-1.5 h-4 w-4" />
            {t("kitchen.fullscreen")}
          </Button>
        }
      />
      
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 xl:grid-cols-3">
          {COLUMNS.map((col) => {
            const list = orders.filter((o) => o.status === col);
            return (
              <div key={col} className={cn("flex flex-col rounded-2xl border p-4", COLOR[col])}>
                <div className="mb-4 flex items-center justify-between px-2">
                  <h3 className="font-display text-xl font-semibold">{t(`orderStatus.${col}`)}</h3>
                  <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">{list.length}</span>
                </div>
                <div className="space-y-3">
                  {list.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">
                      {t("kitchen.noOrders")}
                    </div>
                  ) : (
                    list.map((o) => (
                      <div key={o.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <div className="font-display text-2xl font-bold">{o.orderNumber}</div>
                            <div className="mt-1 text-sm font-medium text-muted-foreground">
                              {o.orderType} • {getOrderLocation(o)}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getTimeAgo(o.createdAt)}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="font-medium">{item.quantity}× {item.name}</span>
                            </div>
                          ))}
                        </div>
                        
                        {o.notes && (
                          <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-2 text-sm text-amber-800">
                            <span className="font-semibold">{t("kitchen.note")} </span>
                            {o.notes}
                          </div>
                        )}
                        
                        {col === "PENDING" && (
                          <Button
                            onClick={() => handleAccept(o.id)}
                            disabled={updating === o.id}
                            className="w-full"
                            size="lg"
                          >
                            {updating === o.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("kitchen.acceptOrder")
                            )}
                          </Button>
                        )}
                        
                        {col === "ACCEPTED" && (
                          <Button
                            onClick={() => handleComplete(o.id)}
                            disabled={updating === o.id}
                            className="w-full"
                            size="lg"
                          >
                            {updating === o.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("kitchen.markCompleted")
                            )}
                          </Button>
                        )}
                        
                        {col === "COMPLETED" && (
                          <div className="text-center text-sm text-muted-foreground font-medium">
                            {t("kitchen.completed")}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
