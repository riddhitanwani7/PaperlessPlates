import mongoose from "mongoose";

const ORDER_STATUS = ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
const ORDER_TYPE = ["RESTAURANT", "TABLE", "ROOM", "TAKEAWAY"];
const PAYMENT_METHOD = ["CASH", "UPI"];
const PAYMENT_STATUS = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const PAYMENT_GATEWAY = ["NONE", "RAZORPAY"];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ORDER_TYPE,
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    tableId: {
      type: String,
      trim: true,
    },
    roomId: {
      type: String,
      trim: true,
    },
    customerSessionId: {
      type: String,
      required: true,
      index: true,
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      default: "CASH",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "PENDING",
    },
    paymentGateway: {
      type: String,
      enum: PAYMENT_GATEWAY,
      default: "NONE",
    },
    paymentId: {
      type: String,
      trim: true,
    },
    paymentGatewayOrderId: {
      type: String,
      trim: true,
    },
    paymentSignature: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "PENDING",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    collection: "orders",
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ customerSessionId: 1, createdAt: -1 });
orderSchema.index({
  restaurantId: 1,
  orderType: 1,
  tableId: 1,
  roomId: 1,
  createdAt: -1
});

export const Order = mongoose.model("Order", orderSchema);
