import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { OrderSummary } from "@/components/customer/OrderSummary";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContext, getContextLabel, type QRContext } from "@/lib/tableContext";
import { getCustomerSessionId } from "@/lib/customerSession";
import { createOrderApi, type CreateOrderRequest } from "@/lib/api/order.api";
import { createPaymentOrderApi, verifyPaymentApi } from "@/lib/api/payment.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

type PaymentMethod = "CASH" | "UPI";

export const Route = createFileRoute("/customer/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { subtotal, tax, total, items, clear } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(true);
  const [currency, setCurrency] = useState("INR");
  
  // Get QR context from localStorage
  const context = getContext();
  const contextLabel = getContextLabel();

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem("pp_customer_restaurant_info");
    if (stored) {
      try {
        const info = JSON.parse(stored);
        setOnlinePaymentsEnabled(info.onlinePaymentsEnabled !== false);
        setCurrency(info.settings?.currency ?? "INR");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (!onlinePaymentsEnabled) {
      setPaymentMethod("CASH");
    }
  }, [onlinePaymentsEnabled]);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      navigate({ to: "/customer/menu" });
    }
  }, [hydrated, items.length, navigate]);

  if (!hydrated) return null;
  if (hydrated && items.length === 0) return null;

 async function handlePlaceOrder() {
  setLoading(true);

  try {
    const customerSessionId = getCustomerSessionId();

    if (!customerSessionId) {
      toast.error("Session error. Please refresh the page.");
      setLoading(false);
      return;
    }

    const restaurantId = localStorage.getItem("pp_customer_restaurant_id");

    if (!restaurantId || !context?.qrCodeId) {
      toast.error("Invalid or expired ordering link. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    const orderData: CreateOrderRequest = {
      qrCodeId: context.qrCodeId,
      restaurantId,
      customerSessionId,
      items: items.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        notes: item.notes,
      })),
      tableId: context?.tableId,
      roomId: context?.roomId,
      orderType: context?.type,
      notes: notes || undefined,
    };

    // ---------------- CASH ----------------

    if (paymentMethod === "CASH") {
      orderData.paymentMethod = "CASH";

      const { order } = await createOrderApi(orderData);

      clear();

      toast.success("Order placed successfully!");

      navigate({
        to: "/customer/order-confirmation/$id",
        params: {
          id: order.orderNumber,
        },
      });

      return;
    }

    // ---------------- UPI ----------------

    const receipt = `PP_${Date.now()}`;

    const paymentOrder = await createPaymentOrderApi({
      currency: "INR",
      receipt,
      restaurantId: restaurantId || undefined,
      qrCodeId: context.qrCodeId,
      items: orderData.items,
    });

    console.log("Payment Order:", paymentOrder);

  const options = {
  key: paymentOrder.key,
  amount: paymentOrder.amount,
  currency: paymentOrder.currency,
  order_id: paymentOrder.orderId,

  name: "PaperlessPlates",
  description: "Restaurant Order Payment",

  prefill: {
    name: name || "",
    contact: phone || "",
  },

  theme: {
    color: "#f97316",
  },

  method: {
    upi: true,
    card: true,
    netbanking: true,
    wallet: true,
    emi: false,
    paylater: true,
  },

  handler: async (response: any) => {
    try {
      const verifyResponse = await verifyPaymentApi({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        orderData: {
          ...orderData,
          paymentMethod: "UPI",
        },
      });

      clear();

      toast.success("Payment successful! Order placed.");

      navigate({
        to: "/customer/order-confirmation/$id",
        params: {
          id: verifyResponse.order.orderNumber,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Payment verification failed.");
    } finally {
      setLoading(false);
    }
  },

  modal: {
    ondismiss: () => {
      setLoading(false);
      toast.info("Payment cancelled.");
    },
  },
};

    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK failed to load.");
      setLoading(false);
      return;
    }

    const razorpay = new (window as any).Razorpay(options);

    razorpay.open();

  } catch (err) {
    console.error("Checkout Error:", err);
    toast.error("Failed to place order.");
    setLoading(false);
  }
}

  return (
    <CustomerLayout showBack title="Checkout">
      <div className="space-y-4 p-4">
        {/* QR Context Display - Read-only */}
        {context && (
          <div className="rounded-2xl border border-border bg-primary-soft p-4">
            <h3 className="font-display text-sm text-muted-foreground">Ordering for</h3>
            <p className="mt-1 font-display text-lg font-semibold text-primary">{contextLabel}</p>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-display text-base">Your details</h3>
          <div>
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
          </div>
          <div>
            <Label className="text-xs">Order notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={2}
              placeholder="Anything we should know?"
            />
          </div>
        </div>

        <OrderSummary subtotal={subtotal} tax={tax} total={total} currency={currency} />

        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-display text-base">Payment Method</h3>
          {!onlinePaymentsEnabled && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
              This restaurant has not configured online payments.
            </div>
          )}
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <div className="flex items-center space-x-3 rounded-xl border border-border bg-background p-3">
              <RadioGroupItem value="CASH" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer font-medium">Cash</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-xl border border-border bg-background p-3">
              <RadioGroupItem value="UPI" id="upi" disabled={!onlinePaymentsEnabled} />
              <Label htmlFor="upi" className={cn("flex-1 cursor-pointer font-medium", !onlinePaymentsEnabled && "text-muted-foreground")}>UPI</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-primary text-base shadow-lg shadow-primary/30"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing order...
            </>
          ) : (
            `Place Order — ${formatCurrency(total, currency)}`
          )}
        </Button>
      </div>
    </CustomerLayout>
  );
}
