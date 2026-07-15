export interface PlanLimits {
  ordersPerMonth: number | null;
  qrCodes: number | null;
  tables: number | null;
  rooms: number | null;
  staffMembers: number | null;
}

export interface Plan {
  id: string;
  name: string;
  priceInr: number | null;
  priceLabel: string;
  billingLabel: string;
  durationDays: number;
  features: string[];
  limits: PlanLimits;
}

export const PLANS: Plan[] = [
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
    limits: {
      ordersPerMonth: 500,
      qrCodes: 20,
      tables: 20,
      rooms: 5,
      staffMembers: 5,
    },
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
    limits: {
      ordersPerMonth: null,
      qrCodes: null,
      tables: null,
      rooms: null,
      staffMembers: null,
    },
  },
];

/**
 * Product-feature flags per plan.
 */
export const PLAN_FEATURES: Record<string, Record<string, boolean>> = {
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

export function getPlanById(planId: string): Plan {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
}

export function formatLimit(value: number | null): string {
  return value === null ? "Unlimited" : value.toString();
}

/**
 * Get the current plan for a restaurant
 */
export function getCurrentPlan(planId?: string): Plan {
  return getPlanById(planId || "STARTER");
}

/**
 * Check if the restaurant's plan has a specific feature
 */
export function hasFeature(planId: string | undefined, featureName: string): boolean {
  const id = planId || "STARTER";
  const features = PLAN_FEATURES[id] || PLAN_FEATURES.STARTER;
  return !!features[featureName];
}

/**
 * Get the limit for a specific resource
 */
export function getLimit(planId: string | undefined, resource: keyof PlanLimits): number | null {
  const plan = getCurrentPlan(planId);
  return plan.limits[resource] ?? null;
}

/**
 * Check if a resource is unlimited for the restaurant's plan
 */
export function isUnlimited(planId: string | undefined, resource: keyof PlanLimits): boolean {
  return getLimit(planId, resource) === null;
}

/**
 * Check if the restaurant can create a new resource based on current count
 */
export function canCreateResource(
  planId: string | undefined,
  resource: keyof PlanLimits,
  currentCount: number
): { allowed: boolean; limit: number | null; current: number; message?: string } {
  const limit = getLimit(planId, resource);

  if (limit === null) {
    return { allowed: true, limit: null, current: currentCount };
  }

  if (currentCount < limit) {
    return { allowed: true, limit, current: currentCount };
  }

  const plan = getCurrentPlan(planId);
  const resourceLabels: Record<keyof PlanLimits, string> = {
    ordersPerMonth: "orders per month",
    qrCodes: "QR codes",
    tables: "tables",
    rooms: "rooms",
    staffMembers: "staff members",
  };

  return {
    allowed: false,
    limit,
    current: currentCount,
    message: `Your ${plan.name} plan allows a maximum of ${limit} ${resourceLabels[resource]}. Contact PaperlessPlates to upgrade to ENTERPRISE for unlimited access.`,
  };
}

/**
 * Get all features for the restaurant's plan
 */
export function getPlanFeatures(planId: string | undefined): Record<string, boolean> {
  const id = planId || "STARTER";
  return PLAN_FEATURES[id] || PLAN_FEATURES.STARTER;
}
