import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Mail } from "lucide-react";
import { PLANS, formatLimit } from "@/lib/subscriptionPlans";
import { useRestaurant } from "@/components/app/RestaurantProvider";

const FEATURE_TRANSLATION_KEYS: Record<string, string> = {
  "Digital Menu": "subscription.features.digitalMenu",
  "QR Ordering": "subscription.features.qrOrdering",
  "Table Ordering": "subscription.features.tableOrdering",
  "Room Ordering": "subscription.features.roomOrdering",
  "Single Theme": "subscription.features.singleTheme",
  "Hindi & English": "subscription.features.hindiEnglish",
  "Online Payments": "subscription.features.onlinePayments",
  "Basic Analytics": "subscription.features.basicAnalytics",
  "Email Notifications": "subscription.features.emailNotifications",
  "Everything in STARTER": "subscription.features.everythingInStarter",
  "Kitchen Display": "subscription.features.kitchenDisplay",
  "Advanced Analytics": "subscription.features.advancedAnalytics",
  "Multiple Themes": "subscription.features.multipleThemes",
  "Unlimited Orders": "subscription.features.unlimitedOrders",
  "Unlimited Staff": "subscription.features.unlimitedStaff",
  "Unlimited Tables": "subscription.features.unlimitedTables",
  "Unlimited Rooms": "subscription.features.unlimitedRooms",
  "Unlimited QR Codes": "subscription.features.unlimitedQrCodes",
};

const COMPARISON_ROWS = [
  { key: "qrOrdering", plans: ["STARTER", "ENTERPRISE"] },
  { key: "tableOrdering", plans: ["STARTER", "ENTERPRISE"] },
  { key: "roomOrdering", plans: ["STARTER", "ENTERPRISE"] },
  { key: "onlinePayments", plans: ["STARTER", "ENTERPRISE"] },
  { key: "basicAnalytics", plans: ["STARTER", "ENTERPRISE"] },
  { key: "kitchenDisplay", plans: ["ENTERPRISE"] },
  { key: "advancedAnalytics", plans: ["ENTERPRISE"] },
  { key: "multipleThemes", plans: ["ENTERPRISE"] },
  { key: "unlimitedOrders", plans: ["ENTERPRISE"] },
  { key: "unlimitedStaff", plans: ["ENTERPRISE"] },
  { key: "unlimitedTables", plans: ["ENTERPRISE"] },
  { key: "unlimitedRooms", plans: ["ENTERPRISE"] },
  { key: "unlimitedQrCodes", plans: ["ENTERPRISE"] },
] as const;

export const Route = createFileRoute("/app/subscription")({
  component: () => (
    <RoleGuard allow={["OWNER"]}>
      <SubscriptionPage />
    </RoleGuard>
  ),
});

function SubscriptionPage() {
  const { t } = useTranslation();
  const { restaurant } = useRestaurant();
  const currentPlan = restaurant?.selectedPlan || "STARTER";
  const plan = PLANS.find((p) => p.id === currentPlan) || PLANS[0];

  return (
    <>
      <PageHeader
        title={t("subscription.title")}
        description={t("subscription.description")}
      />

      <Card className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary-soft to-card p-6 shadow-elevated">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="border-0 bg-gradient-coral text-primary-foreground">
              {t("subscription.currentPlan")}
            </Badge>
            <h2 className="mt-2 font-display text-3xl">{plan.name}</h2>
            <p className="text-sm text-muted-foreground">{t("subscription.managedBy")}</p>
          </div>
        </div>

        {plan.limits && (
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              { label: t("subscription.ordersPerMonth"), value: plan.limits.ordersPerMonth },
              { label: t("subscription.qrCodes"), value: plan.limits.qrCodes },
              { label: t("subscription.staffMembers"), value: plan.limits.staffMembers },
            ].map((u) => (
              <div key={u.label} className="rounded-xl border border-border bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">{u.label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {u.value === null ? t("subscription.unlimited") : formatLimit(u.value)}
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
              <h3 className="font-display text-xl">{t("subscription.needEnterprise")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("subscription.enterpriseDescription")}</p>
            </div>
            <Button
              variant="outline"
              disabled
              className="sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("subscription.requestEnterprise")}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t("subscription.contactToUpgrade")}</p>
        </Card>
      )}

      <Card className="mt-6 rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold">{t("subscription.featuresIncluded", { plan: plan.name })}</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t(FEATURE_TRANSLATION_KEYS[f] ?? f)}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold">{t("subscription.featureComparison")}</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium">{t("subscription.feature")}</th>
                {PLANS.map((p) => (
                  <th key={p.id} className="pb-3 font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-border">
                  <td className="py-3">{t(`subscription.comparison.${row.key}`)}</td>
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
