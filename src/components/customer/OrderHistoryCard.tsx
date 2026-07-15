import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { useEffect, useState } from "react";

type OrderHistoryCardProps = {
  order: {
    id: string;
    orderNumber: string;
    restaurantName: string;
    createdAt: string;
    status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
    items: Array<{ name: string; quantity: number }>;
    paymentMethod: "CASH" | "UPI";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    total: number;
  };
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  READY: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const paymentStatusColors = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
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

  const itemsSummary = order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    <Card className="rounded-2xl p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">{order.restaurantName}</h3>
          <p className="text-xs text-muted-foreground">
            {order.orderNumber} • {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge className={cn("text-xs font-medium", statusColors[order.status])}>
          {order.status}
        </Badge>
      </div>

      <div className="mb-3 space-y-1">
        <p className="text-sm text-muted-foreground">{itemsSummary}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{order.paymentMethod}</span>
          <span>•</span>
          <Badge className={cn("text-xs font-medium", paymentStatusColors[order.paymentStatus])}>
            {order.paymentStatus}
          </Badge>
          <span>•</span>
          <span className="font-semibold text-foreground">{formatCurrency(order.total, currency)}</span>
        </div>
      </div>
    </Card>
  );
}
