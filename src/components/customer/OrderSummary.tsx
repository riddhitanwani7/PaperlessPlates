import { formatCurrency } from "@/lib/format";

export function OrderSummary({
  subtotal,
  tax,
  total,
  fee = 0,
  currency = "INR",
}: {
  subtotal: number;
  tax: number;
  total: number;
  fee?: number;
  currency?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <Row label="Subtotal" value={subtotal} currency={currency} />
      <Row label="Tax (8%)" value={tax} currency={currency} />
      {fee > 0 && <Row label="Service fee" value={fee} currency={currency} />}
      <div className="my-3 border-t border-border" />
      <div className="flex items-baseline justify-between">
        <span className="font-display text-base">Total</span>
        <span className="font-display text-2xl">{formatCurrency(total + fee, currency)}</span>
      </div>
    </div>
  );
}

function Row({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="flex justify-between py-1 text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{formatCurrency(value, currency)}</span>
    </div>
  );
}
