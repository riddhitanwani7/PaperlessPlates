import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Wallet, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/payment")({
  component: PaymentPage,
});

const METHODS = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "netbanking", label: "Netbanking", icon: Building2 },
];

function PaymentPage() {
  const { total } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);

  function pay() {
    setProcessing(true);
    setTimeout(() => {
      const success = Math.random() > 0.15;
      navigate({ to: success ? "/customer/payment/success" : "/customer/payment/failed" });
    }, 1800);
  }

  if (processing) {
    return (
      <CustomerLayout title="Processing payment">
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-5 font-display text-xl">Processing your payment</h2>
          <p className="mt-1 text-sm text-muted-foreground">Do not close or refresh this page…</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout showBack title="Payment">
      <div className="space-y-4 p-4">
        <div className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/30">
          <p className="text-xs uppercase tracking-wider opacity-80">Amount due</p>
          <p className="font-display text-4xl">${total.toFixed(2)}</p>
          <p className="mt-1 text-xs opacity-80">Secured by Razorpay (demo)</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-display text-base">Choose payment method</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                    method === m.id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {method === "card" && (
            <div className="mt-4 space-y-3">
              <Field label="Card number" placeholder="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" placeholder="MM / YY" />
                <Field label="CVV" placeholder="•••" />
              </div>
              <Field label="Cardholder name" placeholder="Name on card" />
            </div>
          )}
          {method === "upi" && (
            <div className="mt-4">
              <Field label="UPI ID" placeholder="name@bank" />
            </div>
          )}
          {method === "wallet" && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Paytm", "PhonePe", "GPay"].map((w) => (
                <div key={w} className="grid h-14 place-items-center rounded-xl border border-border bg-card text-xs font-medium">{w}</div>
              ))}
            </div>
          )}
          {method === "netbanking" && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["HDFC", "ICICI", "Axis", "SBI"].map((b) => (
                <div key={b} className="grid h-12 place-items-center rounded-xl border border-border bg-card text-xs font-medium">{b}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-primary text-base shadow-lg shadow-primary/30"
          onClick={pay}
        >
          Pay ${total.toFixed(2)}
        </Button>
      </div>
    </CustomerLayout>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
