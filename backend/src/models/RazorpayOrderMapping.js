import mongoose from "mongoose";

const razorpayOrderMappingSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ["RESTAURANT", "TABLE", "ROOM", "TAKEAWAY"],
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    receipt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  {
    timestamps: true,
    collection: "razorpay_order_mappings",
  }
);

export const RazorpayOrderMapping = mongoose.model("RazorpayOrderMapping", razorpayOrderMappingSchema);
