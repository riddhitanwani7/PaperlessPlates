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
  const { qrCodeId } = req.query;
  if (!qrCodeId) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired ordering link. Please scan the QR code again.",
    });
  }
  const orders = await orderService.getCustomerOrdersByContext({ customerSessionId, qrCodeId });
  res.json({
    success: true,
    data: { orders },
  });
});

export const getCustomerOrderConfirmation = asyncHandler(async (req, res) => {
  const { customerSessionId, orderId } = req.params;
  const { qrCodeId } = req.query;
  if (!qrCodeId) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired ordering link. Please scan the QR code again.",
    });
  }

  const order = await orderService.getCustomerOrderByIdAndContext({
    customerSessionId,
    orderId,
    qrCodeId,
  });
  res.json({ success: true, data: { order } });
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
  const { qrCodeId, restaurantId, tableId, roomId, orderType } = req.query;

  if (!qrCodeId) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired ordering link. Please scan the QR code again.",
    });
  }

  const orders = await orderService.getCustomerOrdersByContext({
    customerSessionId,
    qrCodeId,
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
