import mongoose from "mongoose";

const ROOM_STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  MAINTENANCE: "MAINTENANCE",
};

const roomSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.AVAILABLE,
    },
    qrAssigned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for restaurant isolation
roomSchema.index({ restaurantId: 1 });

const Room = mongoose.model("Room", roomSchema);

export { Room, ROOM_STATUS };
