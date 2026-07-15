import { apiRequest, apiRequestAuth } from "./client";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  restaurantId: string;
  customerSessionId: string;
  items: OrderItem[];
  tableId?: string;
  roomId?: string;
  orderType?: "TABLE" | "ROOM" | "TAKEAWAY" | "RESTAURANT";
  notes?: string;
  paymentMethod?: "CASH" | "UPI";
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: "RESTAURANT" | "TABLE" | "ROOM" | "TAKEAWAY";
  restaurantId: string;
  restaurantName: string;
  tableId?: string;
  roomId?: string;
  customerSessionId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "CASH" | "UPI";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentGateway: "NONE" | "RAZORPAY";
  paymentId?: string;
  paymentGatewayOrderId?: string;
  paymentSignature?: string;
  paidAt?: string;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function createOrderApi(data: CreateOrderRequest) {
  return apiRequest<{ order: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrderByIdApi(id: string) {
  return apiRequest<{ order: Order }>(`/orders/${id}`);
}

export function getCustomerOrdersApi(sessionId: string) {
  return apiRequest<{ orders: Order[] }>(`/orders/customer/${sessionId}`);
}

export function getCustomerOrdersByContextApi(sessionId: string, params: { restaurantId: string; tableId?: string; roomId?: string; orderType?: string }) {
  const queryParams = new URLSearchParams();
  queryParams.append("restaurantId", params.restaurantId);
  if (params.tableId) queryParams.append("tableId", params.tableId);
  if (params.roomId) queryParams.append("roomId", params.roomId);
  if (params.orderType) queryParams.append("orderType", params.orderType);
  
  return apiRequest<{ orders: Order[] }>(`/orders/customer/${sessionId}/context?${queryParams.toString()}`);
}

export function getRestaurantOrdersApi(restaurantId: string, token: string) {
 return apiRequestAuth<{ orders: Order[] }>(`/orders/restaurant/${restaurantId}`, token);
 }
export function updateOrderStatusApi(orderId: string, status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED", token: string) {
 return apiRequestAuth<{ order: Order }>(`/orders/${orderId}/status`, token, {
     method: "PATCH",
     body: JSON.stringify({ status }),
   });
 }

export function updateOrderPaymentStatusApi(orderId: string, paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED", token: string) {
  return apiRequestAuth<{ order: Order }>(`/orders/${orderId}/payment`, token, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}