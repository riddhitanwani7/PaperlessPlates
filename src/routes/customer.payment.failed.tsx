import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/customer/payment/failed")({
  component: FailedPage,
});

function FailedPage() {
  const navigate = useNavigate();
  return (
    <CustomerLayout title="Payment failed">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-red-100 text-red-600">
          <XCircle className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-2xl">Payment failed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We could not process your payment. No amount was charged.
        </p>
      </div>
      <div className="mx-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-medium">Reason:</p>
        <p>Bank declined the transaction (mock). Please try a different method.</p>
      </div>
      <div className="space-y-2 p-4">
        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-primary"
          onClick={() => navigate({ to: "/customer/payment" })}
        >
          Retry payment
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11 w-full rounded-full">
          <Link to="/customer/cart">Back to cart</Link>
        </Button>
      </div>
    </CustomerLayout>
  );
}
