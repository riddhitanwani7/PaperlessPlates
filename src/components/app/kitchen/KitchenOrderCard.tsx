import { useEffect, useState } from "react";
import type { KitchenOrder, KitchenStatus } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function KitchenOrderCard({
  order,
  onAdvance,
}: {
  order: KitchenOrder;
  onAdvance: (next: KitchenStatus) => void;
}) {
  const [age, setAge] = useState("");
  useEffect(() => {
    const update = () => {
      const m = Math.floor((Date.now() - order.receivedAt) / 60000);
      setAge(m < 1 ? "just now" : `${m}m ago`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [order.receivedAt]);

  const next: Record<KitchenStatus, KitchenStatus | null> = {
    New: "Accepted",
    Accepted: "Preparing",
    Preparing: "Ready",
    Ready: "Completed",
    Completed: null,
  };
  const nextStatus = next[order.status];

  const overdue = Math.floor((Date.now() - order.receivedAt) / 60000) > order.estPrepMin;

  return (
    <div className={cn("rounded-2xl border bg-card p-3 shadow-sm", overdue ? "border-red-300" : "border-border")}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm">{order.id}</p>
          <p className="text-xs text-muted-foreground">{order.source}</p>
        </div>
        {order.priority === "Rush" && (
          <Badge className="border-0 bg-red-100 text-red-700"><Flame className="mr-1 h-3 w-3" />Rush</Badge>
        )}
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between">
            <span>{it.name}</span>
            <span className="font-medium">×{it.qty}</span>
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">{order.notes}</p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className={cn("inline-flex items-center gap-1", overdue && "text-red-600 font-medium")}>
          <Clock className="h-3 w-3" />{age}
        </span>
        <span>~{order.estPrepMin} min</span>
      </div>
      {nextStatus && (
        <button
          onClick={() => onAdvance(nextStatus)}
          className="mt-2 w-full rounded-full bg-gradient-coral py-1.5 text-xs font-semibold text-primary-foreground"
        >
          Move to {nextStatus}
        </button>
      )}
    </div>
  );
}
