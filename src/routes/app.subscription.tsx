import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, formatLimit } from "@/lib/subscriptionPlans";
import { useRestaurant } from "@/components/app/RestaurantProvider";

export const Route = createFileRoute("/app/subscription")({
  component: () => (
    <RoleGuard allow={["OWNER"]}>
      <SubscriptionPage />
    </RoleGuard>
  ),
});

function SubscriptionPage() {
  const { restaurant } = useRestaurant();
  const currentPlan = restaurant?.selectedPlan || "STARTER";
  const plan = PLANS.find((p) => p.id === currentPlan) || PLANS[0];

  return (
    <>
      <PageHeader
        title="Subscription"
        description="View your current plan and features."
      />

      <Card className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary-soft to-card p-6 shadow-elevated">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="border-0 bg-gradient-coral text-primary-foreground">
              Current Plan
            </Badge>
            <h2 className="mt-2 font-display text-3xl">{plan.name}</h2>
            <p className="text-sm text-muted-foreground">
              Managed by PaperlessPlates
            </p>
          </div>
        </div>

        {plan.limits && (
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              { label: "Orders / month", value: plan.limits.ordersPerMonth },
              { label: "QR codes", value: plan.limits.qrCodes },
              { label: "Staff members", value: plan.limits.staffMembers },
            ].map((u) => (
              <div key={u.label} className="rounded-xl border border-border bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">{u.label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatLimit(u.value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {currentPlan === "STARTER" && (
        <Card className="mt-6 rounded-2xl border-primary/30 bg-gradient-to-br from-primary-soft to-card p-6 shadow-elevated">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-xl">Need ENTERPRISE?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Unlock unlimited features, kitchen display, advanced analytics, and more.
              </p>
            </div>
            <Button
              variant="outline"
              disabled
              className="sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              Request Enterprise
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Please contact PaperlessPlates to upgrade your account.
          </p>
        </Card>
      )}

      <Card className="mt-6 rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold">Features included in {plan.name}</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold">Feature comparison</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.id} className="pb-3 font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "QR Ordering", plans: ["STARTER", "ENTERPRISE"] },
                { feature: "Table Ordering", plans: ["STARTER", "ENTERPRISE"] },
                { feature: "Room Ordering", plans: ["STARTER", "ENTERPRISE"] },
                { feature: "Online Payments", plans: ["STARTER", "ENTERPRISE"] },
                { feature: "Basic Analytics", plans: ["STARTER", "ENTERPRISE"] },
                { feature: "Kitchen Display", plans: ["ENTERPRISE"] },
                { feature: "Advanced Analytics", plans: ["ENTERPRISE"] },
                { feature: "Multiple Themes", plans: ["ENTERPRISE"] },
                { feature: "Unlimited Orders", plans: ["ENTERPRISE"] },
                { feature: "Unlimited Staff", plans: ["ENTERPRISE"] },
                { feature: "Unlimited Tables", plans: ["ENTERPRISE"] },
                { feature: "Unlimited Rooms", plans: ["ENTERPRISE"] },
                { feature: "Unlimited QR Codes", plans: ["ENTERPRISE"] },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-border">
                  <td className="py-3">{row.feature}</td>
                  {PLANS.map((p) => (
                    <td key={p.id} className="py-3">
                      {row.plans.includes(p.id) ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
