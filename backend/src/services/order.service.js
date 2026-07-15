import { Order } from "../models/Order.js";
import { Restaurant } from "../models/Restaurant.js";
import { AppError } from "../utils/AppError.js";
import { canCreateResource } from "./subscription.helper.js";

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

// Determine order type from QR context
function determineOrderType(tableId, roomId) {
  if (tableId) return "TABLE";
  if (roomId) return "ROOM";
  return "RESTAURANT"; // Default for now, will be TAKEAWAY if needed
}

// Start of the current calendar month (UTC), used as the monthly order window
function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function createOrder(orderData) {
  const { restaurantId, customerSessionId, items, paymentMethod, tableId, roomId, notes, orderType } = orderData;

  // Validate input
  if (!restaurantId) {
    throw new AppError("Restaurant ID is required", 400);
  }
  if (!customerSessionId) {
    throw new AppError("Customer session ID is required", 400);
  }
  if (!items || items.length === 0) {
    throw new AppError("Order must contain at least one item", 400);
  }
  
  // Validate quantities
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      throw new AppError("Item quantity must be greater than zero", 400);
    }
  }

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  // orderType is required - must come from QR context
  if (!orderType) {
    throw new AppError("Order type is required. Please scan a QR code to begin ordering.", 400);
  }

  // Validate orderType matches the context
  if (orderType === "TABLE" && !tableId) {
    throw new AppError("Table ID is required for table orders", 400);
  }
  if (orderType === "ROOM" && !roomId) {
    throw new AppError("Room ID is required for room orders", 400);
  }

  // Enforce monthly order limit (Basic: 500/mo, Premium/Enterprise: unlimited)
  const ordersThisMonth = await Order.countDocuments({
    restaurantId,
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

  // Calculate totals server-side
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const order = new Order({
    orderNumber,
    orderType,
    restaurantId,
    restaurantName: restaurant.restaurantName,
    tableId,
    roomId,
    customerSessionId,
    items,
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

export async function getCustomerOrdersByContext({ customerSessionId, restaurantId, tableId, roomId, orderType }) {
  // restaurantId is mandatory for restaurant isolation
  if (!restaurantId) {
    throw new AppError("Restaurant ID is required", 400);
  }

  // Build query with mandatory restaurantId and customerSessionId
  const query = { customerSessionId, restaurantId };
  
  if (tableId) {
    query.tableId = tableId;
  }
  
  if (roomId) {
    query.roomId = roomId;
  }
  
  if (orderType) {
    query.orderType = orderType;
  }
  
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return orders.map(sanitizeOrder);
}
