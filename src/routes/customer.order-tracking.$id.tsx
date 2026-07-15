import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { StatusTimeline, type TimelineStatus } from "@/components/customer/StatusTimeline";
import { Button } from "@/components/ui/button";

const STEPS: TimelineStatus[] = ["Placed", "Accepted", "Preparing", "Ready", "Completed"];

export const Route = createFileRoute("/customer/order-tracking/$id")({
  component: TrackingPage,
});

function TrackingPage() {
  const { id } = Route.useParams();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => Math.min(STEPS.length - 1, i + 1)), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <CustomerLayout showBack title={`Order ${id}`}>
      <div className="space-y-4 p-4">
        <div className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/30">
          <p className="text-xs uppercase tracking-wider opacity-80">Current status</p>
          <p className="font-display text-3xl">{STEPS[idx]}</p>
          <p className="mt-1 text-xs opacity-80">Updated just now</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-base">Order progress</h3>
          <StatusTimeline current={STEPS[idx]} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          <p className="text-muted-foreground">Need help?</p>
          <p className="mt-1">Speak to a server or call the front desk for assistance.</p>
        </div>

        <Button asChild variant="outline" className="h-11 w-full rounded-full">
          <Link to="/customer/menu">Order more</Link>
        </Button>
      </div>
    </CustomerLayout>
  );
}
