export const PLANS = ["STARTER", "ENTERPRISE"];

export const ALL_PLAN_IDS = [...PLANS];

export function normalizePlan(plan) {
  return plan;
}

export const PLAN_CATALOG = [
  {
    id: "STARTER",
    name: "STARTER",
    priceInr: null,
    priceLabel: "Managed",
    billingLabel: "",
    durationDays: 30,
    features: [
      "Digital Menu",
      "QR Ordering",
      "Table Ordering",
      "Room Ordering",
      "Single Theme",
      "Hindi & English",
      "Online Payments",
      "Basic Analytics",
      "Email Notifications",
    ],
    limits: { ordersPerMonth: 500, qrCodes: 20, tables: 20, rooms: 5, staffMembers: 5 },
  },
  {
    id: "ENTERPRISE",
    name: "ENTERPRISE",
    priceInr: null,
    priceLabel: "Managed",
    billingLabel: "",
    durationDays: 30,
    features: [
      "Everything in STARTER",
      "Kitchen Display",
      "Advanced Analytics",
      "Multiple Themes",
      "Unlimited Orders",
      "Unlimited Staff",
      "Unlimited Tables",
      "Unlimited Rooms",
      "Unlimited QR Codes",
    ],
    limits: { ordersPerMonth: null, qrCodes: null, tables: null, rooms: null, staffMembers: null },
  },
];

export function getPlanById(planId) {
  const normalized = normalizePlan(planId);
  return PLAN_CATALOG.find((p) => p.id === normalized) ?? PLAN_CATALOG[0];
}

/**
 * Product-feature flags per plan.
 */
export const PLAN_FEATURES = {
  STARTER: {
    kitchenDisplay: false,
    advancedAnalytics: false,
    staffManagement: true,
    onlinePayments: true,
    multipleThemes: false,
  },
  ENTERPRISE: {
    kitchenDisplay: true,
    advancedAnalytics: true,
    staffManagement: true,
    onlinePayments: true,
    multipleThemes: true,
  },
};

export function getPlanFeatures(planId) {
  const normalized = normalizePlan(planId);
  return PLAN_FEATURES[normalized] ?? PLAN_FEATURES.STARTER;
}
