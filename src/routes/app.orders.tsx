import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { PageHeader } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getRestaurantOrdersApi, updateOrderStatusApi, updateOrderPaymentStatusApi, type Order } from "@/lib/api/order.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/app/orders")({
  component: OrdersPage,
});

type TabType = "PENDING" | "ACCEPTED" | "COMPLETED";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-muted text-muted-foreground",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};

const paymentStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

function OrdersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Get restaurant ID from authenticated user profile
        const user = auth.getUser();
       const token = auth.getToken();
           if (!user || !token) {
          toast.error(t("orders.notAuthenticated"));
          setLoading(false);
          return;
        }

        // TODO: Get restaurantId from user profile when backend adds it
        // For now, use owner storage key
        const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
        if (!restaurantId) {
          toast.error(t("orders.restaurantIdMissing"));
          setLoading(false);
          return;
        }

        const { orders: orderData } = await getRestaurantOrdersApi(restaurantId, token);
        setOrders(orderData);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error(t("orders.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  async function handleAccept(orderId: string) {
    setUpdating(orderId);
    try {
      const token = auth.getToken();
  if (!token) throw new Error(t("orders.notAuthenticated"));      await updateOrderStatusApi(orderId, "ACCEPTED", token);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "ACCEPTED" } : o)));
      toast.success(t("orders.orderAccepted"));
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast.error(t("orders.acceptFailed"));
    } finally {
      setUpdating(null);
    }
  }

  async function handleComplete(orderId: string) {
    setUpdating(orderId);
    try {
      const token = auth.getToken();
      if (!token) throw new Error(t("orders.notAuthenticated"));
      await updateOrderStatusApi(orderId, "COMPLETED", token);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "COMPLETED" } : o)));
      toast.success(t("orders.orderCompleted"));
    } catch (error) {
      console.error("Failed to complete order:", error);
      toast.error(t("orders.completeFailed"));
    } finally {
      setUpdating(null);
    }
  }

  async function handleMarkPaid(orderId: string) {
    setUpdating(orderId);
    try {
      const token = auth.getToken();
      if (!token) throw new Error(t("orders.notAuthenticated"));
      await updateOrderPaymentStatusApi(orderId, "PAID", token);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: "PAID", paidAt: new Date().toISOString() } : o)));
      toast.success(t("orders.paymentReceived"));
    } catch (error) {
      console.error("Failed to mark payment:", error);
      toast.error(t("orders.paymentUpdateFailed"));
    } finally {
      setUpdating(null);
    }
  }

  function getOrderLocation(order: Order): string {
    if (order.orderType === "TABLE" && order.tableId) return t("orders.tableLocation", { id: order.tableId });
    if (order.orderType === "ROOM" && order.roomId) return t("orders.roomLocation", { id: order.roomId });
    if (order.orderType === "TAKEAWAY") return t("orderType.TAKEAWAY");
    return t("orderType.RESTAURANT");
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString(i18n.language.startsWith("hi") ? "hi-IN" : "en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <PageHeader
        title={t("orders.title")}
        description={t("orders.description")}
      />

      <Card className="rounded-2xl p-4 shadow-card sm:p-5">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-4 mb-4">
          {(["PENDING", "ACCEPTED", "COMPLETED"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {t(`orderStatus.${tab}`)} ({orders.filter((o) => o.status === tab).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <Loader2 className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="mt-4 font-semibold">{t(`orders.no${activeTab[0]}${activeTab.slice(1).toLowerCase()}Orders`)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === "PENDING" && t("orders.pendingEmpty")}
              {activeTab === "ACCEPTED" && t("orders.acceptedEmpty")}
              {activeTab === "COMPLETED" && t("orders.completedEmpty")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display text-lg font-semibold">{order.orderNumber}</span>
                      <Badge className={cn("border-0", statusStyles[order.status])}>
                        {t(`orderStatus.${order.status}`)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t(`orderType.${order.orderType}`)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t(`paymentMethod.${order.paymentMethod}`)}
                      </Badge>
                      <Badge className={cn("border-0 text-xs", paymentStatusStyles[order.paymentStatus])}>
                        {t(`paymentStatus.${order.paymentStatus}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {getOrderLocation(order)} • {formatTime(order.createdAt)}
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}× {item.name}</span>
                          <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2 text-sm text-amber-800">
                        <span className="font-semibold">{t("orders.note")}: </span>
                        {order.notes}
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-border flex justify-between font-semibold">
                      <span>{t("orders.total")}</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:ml-4">
                    {activeTab === "PENDING" && (
                      <Button
                        onClick={() => handleAccept(order.id)}
                        disabled={updating === order.id}
                        className="w-full sm:w-auto"
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("orders.accept")
                        )}
                      </Button>
                    )}
                    {activeTab === "ACCEPTED" && (
                      <Button
                        onClick={() => handleComplete(order.id)}
                        disabled={updating === order.id}
                        className="w-full sm:w-auto"
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("orders.complete")
                        )}
                      </Button>
                    )}
                    {order.paymentMethod === "CASH" && order.paymentStatus === "PENDING" && (
                      <Button
                        onClick={() => handleMarkPaid(order.id)}
                        disabled={updating === order.id}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("orders.markCashReceived")
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
