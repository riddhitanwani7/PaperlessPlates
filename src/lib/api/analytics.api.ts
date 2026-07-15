import { apiRequestAuth } from "./client";

export type OrderMetrics = {
  today: number;
  week: number;
  month: number;
};

export type RevenueMetrics = {
  today: number;
  week: number;
  month: number;
  changePercent?: number;
};

export type OrderTypeMetric = {
  type: string;
  count: number;
};

export type PeakHourMetric = {
  hour: number;
  count: number;
};

export type PopularItem = {
  name: string;
  quantity: number;
};

export type RecentOrder = {
  id: string;
  orderNumber: string;
  orderType: string;
  total: number;
  status: string;
  createdAt: string;
  tableId: string | null;
  roomId: string | null;
};

export type TrendDay = {
  day: string;
  date: string;
  orders?: number;
  revenue?: number;
  total?: number;
};

export type ActiveQrMenus = {
  total: number;
  byType: {
    Restaurant: number;
    Table: number;
    Room: number;
    Takeaway: number;
  };
};

export type AnalyticsData = {
  totals: {
    orders: OrderMetrics;
    ordersChangePercent: number;
  };
  revenue: RevenueMetrics;
  averageOrderValue: number;
  qrScans: {
    total: number;
    today: number;
  };
  activeQrMenus: ActiveQrMenus;
  orderTypes: OrderTypeMetric[];
  peakHours: PeakHourMetric[];
  popularItems: PopularItem[];
  recentOrders: RecentOrder[];
  ordersTrend: TrendDay[];
  revenueTrend: TrendDay[];
};

export function getAnalyticsApi(token: string, restaurantId: string) {
  return apiRequestAuth<AnalyticsData>(`/analytics/restaurant/${restaurantId}`, token);
}
