import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  DollarSign,
  QrCode,
  Sparkles,
  ArrowUpRight,
  Plus,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { getAnalyticsApi, type AnalyticsData } from "@/lib/api/analytics.api";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { formatCurrency, formatPercentChange, formatTime, orderLocationLabel } from "@/lib/format";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function KPI({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-2xl border-border p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl">{value}</p>
          {delta && (
            <p className="mt-1 flex items-center gap-1 text-xs text-primary">
              <ArrowUpRight className="h-3 w-3" /> {delta}
            </p>
          )}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const { t } = useTranslation();
  const { restaurant } = useRestaurant();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const currency = restaurant?.settings?.currency ?? "INR";
  const timezone = restaurant?.settings?.timezone ?? "Asia/Kolkata";

  useEffect(() => {
    async function load() {
      const token = auth.getToken();
      const restaurantId =
        restaurant?.id ??
        auth.getUser()?.restaurantId ??
        localStorage.getItem("pp_owner_restaurant_id") ??
        undefined;
      if (!token || !restaurantId) {
        setLoading(false);
        return;
      }
      try {
        const analyticsData = await getAnalyticsApi(token, restaurantId);
        setAnalytics(analyticsData);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [restaurant?.id, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const qr = analytics?.activeQrMenus;
  const qrDelta = qr
    ? [
        qr.byType.Table > 0 ? t("dashboard.tables", { count: qr.byType.Table }) : null,
        qr.byType.Room > 0 ? t("dashboard.rooms", { count: qr.byType.Room }) : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/preview">{t("dashboard.viewQrMenu")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/app/menu">
                <Plus className="mr-1 h-4 w-4" /> {t("dashboard.newItem")}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          label={t("dashboard.ordersToday")}
          value={String(analytics?.totals.orders.today ?? 0)}
          delta={`${formatPercentChange(analytics?.totals.ordersChangePercent ?? 0)} ${t("dashboard.vsYesterday")}`}
          icon={ShoppingBag}
        />
        <KPI
          label={t("dashboard.revenueToday")}
          value={formatCurrency(analytics?.revenue.today ?? 0, currency)}
          delta={`${formatPercentChange(analytics?.revenue.changePercent ?? 0)} ${t("dashboard.vsYesterday")}`}
          icon={DollarSign}
        />
        <KPI
          label={t("dashboard.activeQr")}
          value={String(qr?.total ?? 0)}
          delta={qrDelta || undefined}
          icon={QrCode}
        />
        <KPI
          label={t("dashboard.subscription")}
          value={restaurant?.selectedPlan ?? "STARTER"}
          icon={Sparkles}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("dashboard.ordersTrend")}</h3>
              <p className="text-xs text-muted-foreground">{t("dashboard.last7Days")}</p>
            </div>
            <Badge variant="secondary">
              {formatPercentChange(analytics?.totals.ordersChangePercent ?? 0)}
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.ordersTrend ?? []}>
                <defs>
                  <linearGradient id="o" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={2} fill="url(#o)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("dashboard.revenueTrend")}</h3>
              <p className="text-xs text-muted-foreground">{t("dashboard.last7Days")}</p>
            </div>
            <Badge variant="secondary">
              {formatCurrency(analytics?.revenue.week ?? 0, currency)}
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.revenueTrend ?? []}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v, currency)}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{t("dashboard.liveOrders")}</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/orders">{t("dashboard.viewAll")}</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {(analytics?.recentOrders ?? []).slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`orderType.${o.orderType}`)} • {orderLocationLabel(o)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{formatTime(o.createdAt, timezone)}</span>
                  <span className="font-medium">{formatCurrency(o.total, currency)}</span>
                  <Badge variant="outline" className="text-xs">
                    {t(`orderStatus.${o.status}`)}
                  </Badge>
                </div>
              </div>
            ))}
            {(analytics?.recentOrders ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.noOrders")}</p>
            )}
          </div>
        </Card>
        <Card className="rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold">{t("dashboard.quickActions")}</h3>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/app/menu">
                <Plus className="mr-2 h-4 w-4" /> {t("dashboard.createItem")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/app/qr-management">
                <QrCode className="mr-2 h-4 w-4" /> {t("dashboard.generateQr")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/app/orders">
                <ShoppingBag className="mr-2 h-4 w-4" /> {t("dashboard.viewOrders")}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
