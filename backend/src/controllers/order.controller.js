import * as orderService from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json({
    success: true,
    data: { order },
  });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { customerSessionId } = req.params;
  const orders = await orderService.getOrdersByCustomerSession(customerSessionId);
  res.json({
    success: true,
    data: { orders },
  });
});

export const getRestaurantOrders = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "No restaurant associated with your account",
    });
  }
  const orders = await orderService.getOrdersByRestaurant(restaurantId);
  res.json({
    success: true,
    data: { orders },
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json({
    success: true,
    data: { order },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.json({
    success: true,
    data: { order },
  });
});

export const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  if (!paymentStatus) {
    return res.status(400).json({
      success: false,
      message: "Payment status is required",
    });
  }

  const order = await orderService.updateOrderPaymentStatus(req.params.id, paymentStatus);
  res.json({
    success: true,
    data: { order },
  });
});

export const getCustomerOrdersByContext = asyncHandler(async (req, res) => {
  const { customerSessionId } = req.params;
  const { restaurantId, tableId, roomId, orderType } = req.query;
  
  // restaurantId is mandatory for restaurant isolation
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: "Restaurant ID is required",
    });
  }
  
  const orders = await orderService.getCustomerOrdersByContext({
    customerSessionId,
    restaurantId,
    tableId,
    roomId,
    orderType,
  });
  
  res.json({
    success: true,
    data: { orders },
  });
});
