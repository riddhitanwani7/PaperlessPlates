import { Order } from "../models/Order.js";
import { MenuItem } from "../models/MenuItem.js";
import { AppError } from "../utils/AppError.js";
import { canCreateResource } from "./subscription.helper.js";
import { getOrderingContext } from "./ordering-context.service.js";

function sanitizeOrder(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName || "",
    tableId: order.tableId,
    roomId: order.roomId,
    customerSessionId: order.customerSessionId,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    paymentMethod: order.paymentMethod || "CASH",
    paymentStatus: order.paymentStatus || "PENDING",
    paymentGateway: order.paymentGateway || "NONE",
    paymentId: order.paymentId,
    paymentGatewayOrderId: order.paymentGatewayOrderId,
    paymentSignature: order.paymentSignature,
    paidAt: order.paidAt,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// Generate order number in format ORD-XXXX
async function generateOrderNumber() {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  let nextNumber = 1001;
  
  if (lastOrder && lastOrder.orderNumber) {
    const lastNumber = parseInt(lastOrder.orderNumber.replace("ORD-", ""));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return `ORD-${nextNumber}`;
}

// Start of the current calendar month (UTC), used as the monthly order window
function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getOrderQuote({ items, qrCodeId, restaurantId }) {
  if (!items || items.length === 0) throw new AppError("Order must contain at least one item", 400);
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) throw new AppError("Item quantity must be greater than zero", 400);
  }

  const context = await getOrderingContext(qrCodeId, restaurantId);
  const menuItemIds = items.map((item) => item.menuItemId);
  if (menuItemIds.some((id) => !id)) throw new AppError("Invalid menu item", 400);

  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, restaurantId: context.restaurant._id, available: true });
  if (menuItems.length !== new Set(menuItemIds.map(String)).size) {
    throw new AppError("One or more items are unavailable for this restaurant", 400);
  }

  const menuItemById = new Map(menuItems.map((item) => [item._id.toString(), item]));
  const validatedItems = items.map((item) => {
    const menuItem = menuItemById.get(String(item.menuItemId));
    return { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: item.quantity, notes: item.notes };
  });
  const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  return { context, validatedItems, subtotal, tax, total: +(subtotal + tax).toFixed(2) };
}

export async function createOrder(orderData) {
  const { restaurantId, customerSessionId, items, paymentMethod, tableId, roomId, notes, orderType, qrCodeId } = orderData;

  // Validate input
  if (!customerSessionId) {
    throw new AppError("Customer session ID is required", 400);
  }
  const quote = await getOrderQuote({ items, qrCodeId, restaurantId });
  const { context, validatedItems, subtotal, tax, total } = quote;
  const restaurant = context.restaurant;
  if ((orderType && orderType !== context.orderType) || tableId !== context.tableId || roomId !== context.roomId) {
    throw new AppError("Invalid or expired ordering link. Please scan the QR code again.", 400);
  }

  // Enforce monthly order limit (Basic: 500/mo, Premium/Enterprise: unlimited)
  const ordersThisMonth = await Order.countDocuments({
    restaurantId: restaurant._id,
    createdAt: { $gte: startOfCurrentMonth() },
  });
  const limitCheck = canCreateResource(restaurant, "ordersPerMonth", ordersThisMonth);
  if (!limitCheck.allowed) {
    throw new AppError(
      "This restaurant has reached its monthly order capacity. Please contact staff to place your order.",
      403
    );
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();

  const order = new Order({
    orderNumber,
    orderType: context.orderType,
    restaurantId: restaurant._id,
    restaurantName: restaurant.restaurantName,
    tableId: context.tableId,
    roomId: context.roomId,
    customerSessionId,
    items: validatedItems,
    subtotal,
    tax,
    total,
    paymentMethod: paymentMethod || "CASH",
    notes,
  });

  await order.save();
  return sanitizeOrder(order);
}

export async function getOrdersByCustomerSession(customerSessionId) {
  const orders = await Order.find({ customerSessionId }).sort({ createdAt: -1 });
  return orders.map(sanitizeOrder);
}

export async function getOrdersByRestaurant(restaurantId) {
  const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
  return orders.map(sanitizeOrder);
}

export async function getOrderById(orderId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  return sanitizeOrder(order);
}

export async function updateOrderStatus(orderId, status) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  order.status = status;
  await order.save();
  return sanitizeOrder(order);
}

export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  order.paymentStatus = paymentStatus;
  if (paymentStatus === "PAID") {
    order.paidAt = new Date();
  }
  await order.save();
  return sanitizeOrder(order);
}

export async function getCustomerOrdersByContext({ customerSessionId, qrCodeId, restaurantId, tableId, roomId, orderType }) {
  const context = await getOrderingContext(qrCodeId, restaurantId);
  if ((tableId && tableId !== context.tableId) || (roomId && roomId !== context.roomId) || (orderType && orderType !== context.orderType)) {
    throw new AppError("Invalid or expired ordering link. Please scan the QR code again.", 400);
  }

  const query = {
    customerSessionId,
    restaurantId: context.restaurant._id,
    orderType: context.orderType,
    ...(context.tableId && { tableId: context.tableId }),
    ...(context.roomId && { roomId: context.roomId }),
  };
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return orders.map(sanitizeOrder);
}
