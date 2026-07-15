import { apiRequest } from "./client";
import { type CreateOrderRequest, type Order } from "./order.api";

export interface CreatePaymentOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  restaurantId?: string;
}

export interface CreatePaymentOrderResponse {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  orderData: CreateOrderRequest;
}

export function createPaymentOrderApi(data: CreatePaymentOrderRequest) {
  return apiRequest<CreatePaymentOrderResponse>(
    "/payments/create-order",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function verifyPaymentApi(data: VerifyPaymentRequest) {
  return apiRequest<{ order: Order }>(
    "/payments/verify",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}