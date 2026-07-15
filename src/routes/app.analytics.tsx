import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { getAnalyticsApi, type AnalyticsData } from "@/lib/api/analytics.api";
import { Loader2, Lock } from "lucide-react";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { hasFeature } from "@/lib/subscriptionPlans";

export const Route = createFileRoute("/app/analytics")({
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER"]}><AnalyticsPage /></RoleGuard>
  ),
});

const pieColors = ["var(--primary)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function formatHour(hour: number): string {
  const locale = i18n.language.startsWith("hi") ? "hi-IN" : "en-US";
  return new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true }).format(new Date(2000, 0, 1, hour, 0, 0));
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString()}`;
}

function AnalyticsPage() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { restaurant } = useRestaurant();
  const planId = restaurant?.selectedPlan;

  // Check if has advanced analytics
  const hasAdvancedAnalytics = hasFeature(planId, "advancedAnalytics");

  async function fetchAnalytics() {
    try {
      const token = auth.getToken();
      const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
      if (!token || !restaurantId) {
        setLoading(false);
        return;
      }

      const data = await getAnalyticsApi(token, restaurantId);
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error(t("analytics.loadFailed"));
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          title={t("analytics.title")}
          description={t("analytics.description")}
        />
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!analytics) {
    return (
      <>
        <PageHeader
          title={t("analytics.title")}
          description={t("analytics.description")}
        />
        <div className="flex justify-center py-16">
          <p className="text-muted-foreground">{t("analytics.noData")}</p>
        </div>
      </>
    );
  }

  const pieData = analytics.orderTypes.map((item) => ({
    name: t(`orderType.${item.type}`),
    value: item.count,
  }));

  const totalOrders = pieData.reduce((sum, item) => sum + item.value, 0);
  const pieDataWithPercentage = pieData.map((item) => ({
    ...item,
    percentage: totalOrders > 0 ? Math.round((item.value / totalOrders) * 100) : 0,
  }));

  const peakHoursData = analytics.peakHours.map((item) => ({
    hour: formatHour(item.hour),
    count: item.count,
  }));

  const revenueTrendData = analytics.revenueTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString(i18n.language.startsWith("hi") ? "hi-IN" : "en-US", { weekday: 'short', month: 'short', day: 'numeric' }),
    total: item.total,
  }));

  return (
    <>
      <PageHeader
        title={t("analytics.title")}
        description={t("analytics.description")}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl p-5 shadow-card">
          <p className="text-xs text-muted-foreground">{t("analytics.totalOrdersToday")}</p>
          <p className="mt-2 font-display text-2xl">{analytics.totals.orders.today}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("analytics.thisWeek")}: {analytics.totals.orders.week}</p>
        </Card>
        <Card className="rounded-2xl p-5 shadow-card">
          <p className="text-xs text-muted-foreground">{t("analytics.revenueToday")}</p>
          <p className="mt-2 font-display text-2xl">{formatCurrency(analytics.revenue.today)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("analytics.thisWeek")}: {formatCurrency(analytics.revenue.week)}</p>
        </Card>
        <Card className="rounded-2xl p-5 shadow-card">
          <p className="text-xs text-muted-foreground">{t("analytics.averageOrderValue")}</p>
          <p className="mt-2 font-display text-2xl">{formatCurrency(analytics.averageOrderValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("analytics.thisMonth")}</p>
        </Card>
        <Card className="rounded-2xl p-5 shadow-card">
          <p className="text-xs text-muted-foreground">{t("analytics.qrScansToday")}</p>
          <p className="mt-2 font-display text-2xl">{analytics.qrScans.today}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("analytics.total")}: {analytics.qrScans.total}</p>
        </Card>
      </div>

      {!hasAdvancedAnalytics && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="font-medium">{t("analytics.advancedTitle")}</span>
          </div>
          <p className="mt-1">{t("analytics.advancedDescription")}</p>
        </div>
      )}

      <div className="mt-6">
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("analytics.revenueTrend")}</h3>
              <p className="text-xs text-muted-foreground">{t("analytics.dailyRevenueLast7Days")}</p>
            </div>
            <Badge variant="secondary">{t("analytics.last7Days")}</Badge>
          </div>
          <div className="h-72">
            {revenueTrendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t("analytics.noRevenueData")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("analytics.peakHours")}</h3>
              <p className="text-xs text-muted-foreground">{t("analytics.orderVolumeByHour")}</p>
            </div>
            <Badge variant="secondary">{t("analytics.thisMonth")}</Badge>
          </div>
          <div className="h-72">
            {peakHoursData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t("analytics.noOrdersYet")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{t("analytics.ordersByType")}</h3>
            <Badge variant="secondary">{t("analytics.thisMonth")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t("analytics.whereOrdersComeFrom")}</p>
          <div className="h-56">
            {totalOrders === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t("analytics.noOrdersYet")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieDataWithPercentage} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pieDataWithPercentage.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => [`${value} (${pieDataWithPercentage.find(p => p.name === name)?.percentage || 0}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {totalOrders > 0 && (
            <ul className="space-y-1 text-xs">
              {pieDataWithPercentage.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                    {p.name}
                  </span>
                  <span className="text-muted-foreground">{p.value} ({p.percentage}%)</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{t("analytics.popularItems")}</h3>
            <Badge variant="secondary">{t("analytics.thisMonth")}</Badge>
          </div>
          <ul className="divide-y divide-border">
            {analytics.popularItems.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">{t("analytics.noItemsSoldYet")}</li>
            ) : (
              analytics.popularItems.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{p.quantity} {t("analytics.sold")}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{t("analytics.recentOrders")}</h3>
            <Badge variant="secondary">{t("analytics.latest10")}</Badge>
          </div>
          <ul className="divide-y divide-border">
            {analytics.recentOrders.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">{t("analytics.noOrdersYet")}</li>
            ) : (
              analytics.recentOrders.map((order) => (
                <li key={order.orderNumber} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{t(`orderType.${order.orderType}`)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                    <Badge variant="outline" className="text-xs">{t(`orderStatus.${order.status}`)}</Badge>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}
