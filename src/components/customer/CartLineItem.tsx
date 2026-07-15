import type { CartItem } from "@/lib/cart";
import { QuantityStepper } from "./QuantityStepper";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export function CartLineItem({
  item,
  onQty,
  onRemove,
  onNotes,
  currency = "INR",
}: {
  item: CartItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
  onNotes?: (notes: string) => void;
  currency?: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-tight">{item.name}</p>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{formatCurrency(item.price, currency)} each</p>
        {onNotes && (
          <input
            value={item.notes ?? ""}
            onChange={(e) => onNotes(e.target.value)}
            placeholder="Add note (allergies, prefs)…"
            className="mt-1 w-full border-0 border-b border-transparent bg-transparent px-0 py-1 text-xs placeholder:text-muted-foreground focus:border-border focus:outline-none"
          />
        )}
        <div className="mt-auto flex items-end justify-between pt-1.5">
          <QuantityStepper value={item.qty} onChange={onQty} min={1} size="sm" />
          <span className="font-display text-base">{formatCurrency(item.qty * item.price, currency)}</span>
        </div>
      </div>
    </div>
  );
}
