import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    qrUrl: {
      type: String,
      required: true,
      trim: true,
    },
    qrImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    qrImagePublicId: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Restaurant", "Table", "Room", "Takeaway"],
      default: "Restaurant",
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
    active: {
      type: Boolean,
      default: true,
    },
    scans: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "qrCodes",
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

// Compound unique indexes to allow multiple QR codes per restaurant
// Restaurant QR: one per restaurant
qrCodeSchema.index({ restaurantId: 1, type: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    type: "Restaurant"
  }
});

// Takeaway QR: one per restaurant
qrCodeSchema.index({ restaurantId: 1, type: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    type: "Takeaway"
  }
});

// Table QR: unique by restaurantId + tableId
qrCodeSchema.index({ restaurantId: 1, tableId: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    type: "Table",
    tableId: { $exists: true, $ne: null }
  }
});

// Room QR: unique by restaurantId + roomId
qrCodeSchema.index({ restaurantId: 1, roomId: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    type: "Room",
    roomId: { $exists: true, $ne: null }
  }
});

export const QRCode = mongoose.model("QRCode", qrCodeSchema);
