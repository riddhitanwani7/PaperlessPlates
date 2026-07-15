import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { QRCode } from "../models/QRCode.js";
import { AppError } from "../utils/AppError.js";

function getTodayStart() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getMonthStart() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start;
}

function getYesterdayStart() {
  const today = getTodayStart();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function getYesterdayEnd() {
  return getTodayStart();
}

function formatDayLabel(date) {
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function calcPercentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function getOrderMetrics(restaurantId) {
  const todayStart = getTodayStart();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  // Convert string restaurantId to ObjectId for MongoDB queries
  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const [todayOrders, weekOrders, monthOrders] = await Promise.all([
    Order.countDocuments({
      restaurantId: restaurantObjectId,
      createdAt: { $gte: todayStart },
    }),
    Order.countDocuments({
      restaurantId: restaurantObjectId,
      createdAt: { $gte: weekStart },
    }),
    Order.countDocuments({
      restaurantId: restaurantObjectId,
      createdAt: { $gte: monthStart },
    }),
  ]);

  return {
    today: todayOrders,
    week: weekOrders,
    month: monthOrders,
  };
}

export async function getRevenueMetrics(restaurantId) {
  const todayStart = getTodayStart();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurantObjectId,
          status: { $in: ["COMPLETED", "ACCEPTED"]},
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurantObjectId,
          status: { $in: ["COMPLETED", "ACCEPTED", "PENDING"] },
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurantObjectId,
          status: { $in: ["COMPLETED", "ACCEPTED"] },
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),
  ]);

  return {
    today: todayRevenue[0]?.total || 0,
    week: weekRevenue[0]?.total || 0,
    month: monthRevenue[0]?.total || 0,
  };
}

export async function getAverageOrderValue(restaurantId) {
  const monthStart = getMonthStart();

  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: { $in: ["COMPLETED", "ACCEPTED"] },
        createdAt: { $gte: monthStart },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0 || result[0].totalOrders === 0) {
    return 0;
  }

  return Math.round(result[0].totalRevenue / result[0].totalOrders);
}

export async function getQRScanMetrics(restaurantId) {
  const todayStart = getTodayStart();

  // Convert string restaurantId to ObjectId for MongoDB queries
  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const [totalScans, todayScans] = await Promise.all([
    QRCode.countDocuments({ restaurantId: restaurantObjectId }),
    QRCode.countDocuments({
      restaurantId: restaurantObjectId,
      createdAt: { $gte: todayStart },
    }),
  ]);

  return {
    total: totalScans,
    today: todayScans,
  };
}

export async function getOrderTypeMetrics(restaurantId) {
  const monthStart = getMonthStart();

  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        createdAt: { $gte: monthStart },
      },
    },
    {
      $group: {
        _id: "$orderType",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const orderTypes = {
    TABLE: 0,
    ROOM: 0,
    TAKEAWAY: 0,
    RESTAURANT: 0,
  };

  result.forEach((item) => {
    if (orderTypes.hasOwnProperty(item._id)) {
      orderTypes[item._id] = item.count;
    }
  });

  return Object.entries(orderTypes).map(([type, count]) => ({
    type,
    count,
  }));
}

export async function getPeakHours(restaurantId) {
  const monthStart = getMonthStart();

  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        createdAt: { $gte: monthStart },
      },
    },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return result.map((item) => ({
    hour: item._id,
    count: item.count,
  }));
}

export async function getPopularItems(restaurantId) {
  const monthStart = getMonthStart();

  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: { $in: ["COMPLETED", "ACCEPTED"] },
        createdAt: { $gte: monthStart },
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
      },
    },
    {
      $sort: { quantity: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return result.map((item) => ({
    name: item._id,
    quantity: item.quantity,
  }));
}

export async function getRecentOrders(restaurantId) {
  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const result = await Order.find({ restaurantId: restaurantObjectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderNumber orderType total status createdAt tableId roomId");

  return result.map((order) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    tableId: order.tableId || null,
    roomId: order.roomId || null,
  }));
}

function getSevenDaysAgo() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  return sevenDaysAgo;
}

export async function getYesterdayOrderCount(restaurantId) {
  const restaurantObjectId = typeof restaurantId === "string"
    ? new mongoose.Types.ObjectId(restaurantId)
    : restaurantId;

  return Order.countDocuments({
    restaurantId: restaurantObjectId,
    createdAt: { $gte: getYesterdayStart(), $lt: getYesterdayEnd() },
  });
}

export async function getYesterdayRevenue(restaurantId) {
  const restaurantObjectId = typeof restaurantId === "string"
    ? new mongoose.Types.ObjectId(restaurantId)
    : restaurantId;

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: { $in: ["COMPLETED", "ACCEPTED"] },
        createdAt: { $gte: getYesterdayStart(), $lt: getYesterdayEnd() },
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  return result[0]?.total || 0;
}

export async function getOrdersTrend(restaurantId) {
  const restaurantObjectId = typeof restaurantId === "string"
    ? new mongoose.Types.ObjectId(restaurantId)
    : restaurantId;

  const now = new Date();
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    days.push({ date, start: date, end: next });
  }

  return Promise.all(
    days.map(async ({ date, start, end }) => {
      const [orders, revenueResult] = await Promise.all([
        Order.countDocuments({
          restaurantId: restaurantObjectId,
          createdAt: { $gte: start, $lt: end },
        }),
        Order.aggregate([
          {
            $match: {
              restaurantId: restaurantObjectId,
              status: { $in: ["COMPLETED", "ACCEPTED"] },
              createdAt: { $gte: start, $lt: end },
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);

      return {
        day: formatDayLabel(date),
        date: date.toISOString(),
        orders,
        revenue: revenueResult[0]?.total || 0,
      };
    }),
  );
}

export async function getActiveQrMetrics(restaurantId) {
  const restaurantObjectId = typeof restaurantId === "string"
    ? new mongoose.Types.ObjectId(restaurantId)
    : restaurantId;

  const result = await QRCode.aggregate([
    { $match: { restaurantId: restaurantObjectId, active: true } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  const byType = { Restaurant: 0, Table: 0, Room: 0, Takeaway: 0 };
  result.forEach((item) => {
    if (byType[item._id] !== undefined) {
      byType[item._id] = item.count;
    }
  });

  return {
    total: Object.values(byType).reduce((sum, n) => sum + n, 0),
    byType,
  };
}

export async function getRevenueTrend(restaurantId) {
  const sevenDaysAgo = getSevenDaysAgo();

  const restaurantObjectId = typeof restaurantId === 'string' 
    ? new mongoose.Types.ObjectId(restaurantId) 
    : restaurantId;

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: { $in: ["COMPLETED", "ACCEPTED"] },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        date: { $first: "$createdAt" },
        total: { $sum: "$total" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  return result.map((item) => ({
    day: formatDayLabel(new Date(item.date)),
    date: item.date,
    total: item.total,
  }));
}

export async function getAnalytics(restaurantId) {
  if (!restaurantId) {
    throw new AppError("Restaurant ID is required", 400);
  }

  const [
    orderMetrics,
    revenueMetrics,
    averageOrderValue,
    qrScanMetrics,
    orderTypes,
    peakHours,
    popularItems,
    recentOrders,
    revenueTrend,
    ordersTrend,
    yesterdayOrders,
    yesterdayRevenue,
    activeQrMenus,
  ] = await Promise.all([
    getOrderMetrics(restaurantId),
    getRevenueMetrics(restaurantId),
    getAverageOrderValue(restaurantId),
    getQRScanMetrics(restaurantId),
    getOrderTypeMetrics(restaurantId),
    getPeakHours(restaurantId),
    getPopularItems(restaurantId),
    getRecentOrders(restaurantId),
    getRevenueTrend(restaurantId),
    getOrdersTrend(restaurantId),
    getYesterdayOrderCount(restaurantId),
    getYesterdayRevenue(restaurantId),
    getActiveQrMetrics(restaurantId),
  ]);

  return {
    totals: {
      orders: orderMetrics,
      ordersChangePercent: calcPercentChange(orderMetrics.today, yesterdayOrders),
    },
    revenue: {
      ...revenueMetrics,
      changePercent: calcPercentChange(revenueMetrics.today, yesterdayRevenue),
    },
    averageOrderValue,
    qrScans: qrScanMetrics,
    activeQrMenus,
    orderTypes,
    peakHours,
    popularItems,
    recentOrders,
    ordersTrend,
    revenueTrend,
  };
}
