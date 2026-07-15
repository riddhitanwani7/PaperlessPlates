import { getPlanById, PLAN_FEATURES } from "../config/plans.js";

/**
 * Get the current plan for a restaurant
 * @param {Object} restaurant - Restaurant document
 * @returns {Object} Plan object from PLAN_CATALOG
 */
export function getCurrentPlan(restaurant) {
  const planId = restaurant.selectedPlan || "STARTER";
  return getPlanById(planId);
}

/**
 * Check if the restaurant's plan has a specific feature
 * @param {Object} restaurant - Restaurant document
 * @param {string} featureName - Feature name (e.g., 'kitchenDisplay', 'multipleThemes')
 * @returns {boolean} True if feature is available
 */
export function hasFeature(restaurant, featureName) {
  const planId = restaurant.selectedPlan || "STARTER";
  const features = PLAN_FEATURES[planId] || PLAN_FEATURES.STARTER;
  return !!features[featureName];
}

/**
 * Get the limit for a specific resource
 * @param {Object} restaurant - Restaurant document
 * @param {string} resource - Resource name (e.g., 'staffMembers', 'tables', 'qrCodes')
 * @returns {number|null} Limit value or null if unlimited
 */
export function getLimit(restaurant, resource) {
  const plan = getCurrentPlan(restaurant);
  return plan.limits?.[resource] ?? null;
}

/**
 * Check if a resource is unlimited for the restaurant's plan
 * @param {Object} restaurant - Restaurant document
 * @param {string} resource - Resource name
 * @returns {boolean} True if unlimited
 */
export function isUnlimited(restaurant, resource) {
  return getLimit(restaurant, resource) === null;
}

/**
 * Check if the restaurant can create a new resource based on current count
 * @param {Object} restaurant - Restaurant document
 * @param {string} resource - Resource name
 * @param {number} currentCount - Current count of the resource
 * @returns {Object} { allowed: boolean, limit: number|null, current: number, message?: string }
 */
export function canCreateResource(restaurant, resource, currentCount) {
  const limit = getLimit(restaurant, resource);
  
  if (limit === null) {
    return { allowed: true, limit: null, current: currentCount };
  }
  
  if (currentCount < limit) {
    return { allowed: true, limit, current: currentCount };
  }
  
  const plan = getCurrentPlan(restaurant);
  const resourceLabels = {
    staffMembers: "staff members",
    tables: "tables",
    rooms: "rooms",
    qrCodes: "QR codes",
    ordersPerMonth: "orders per month",
  };
  
  return {
    allowed: false,
    limit,
    current: currentCount,
    message: `Your ${plan.name} plan allows a maximum of ${limit} ${resourceLabels[resource] || resource}. Contact PaperlessPlates to upgrade to ENTERPRISE for unlimited access.`
  };
}

/**
 * Get all features for the restaurant's plan
 * @param {Object} restaurant - Restaurant document
 * @returns {Object} Feature flags object
 */
export function getPlanFeatures(restaurant) {
  const planId = restaurant.selectedPlan || "STARTER";
  return PLAN_FEATURES[planId] || PLAN_FEATURES.STARTER;
}
