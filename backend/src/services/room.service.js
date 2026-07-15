import { Room } from "../models/Room.js";
import { Restaurant } from "../models/Restaurant.js";
import { AppError } from "../utils/AppError.js";

function sanitizeRoom(room) {
  return {
    id: room._id,
    restaurantId: room.restaurantId,
    roomNumber: room.roomNumber,
    floor: room.floor,
    status: room.status,
    qrAssigned: room.qrAssigned,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

export async function createRoom(roomData) {
  const { restaurantId, roomNumber, floor, status } = roomData;

  // Validate input
  if (!restaurantId) {
    throw new AppError("Restaurant ID is required", 400);
  }
  if (!roomNumber) {
    throw new AppError("Room number is required", 400);
  }
  if (!floor || floor <= 0) {
    throw new AppError("Floor must be greater than zero", 400);
  }

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  // Check if room number already exists for this restaurant
  const existingRoom = await Room.findOne({ restaurantId, roomNumber });
  if (existingRoom) {
    throw new AppError("Room number already exists for this restaurant", 400);
  }

  const room = new Room({
    restaurantId,
    roomNumber,
    floor,
    status: status || "AVAILABLE",
    qrAssigned: false,
  });

  await room.save();
  return sanitizeRoom(room);
}

export async function getRoomsByRestaurant(restaurantId) {
  const rooms = await Room.find({ restaurantId }).sort({ floor: 1, roomNumber: 1 });
  return rooms.map(sanitizeRoom);
}

export async function getRoomById(roomId) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found", 404);
  }
  return sanitizeRoom(room);
}

export async function updateRoom(roomId, updateData) {
  const { roomNumber, floor, status, qrAssigned } = updateData;

  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  // If updating room number, check for duplicates
  if (roomNumber && roomNumber !== room.roomNumber) {
    const existingRoom = await Room.findOne({
      restaurantId: room.restaurantId,
      roomNumber,
    });
    if (existingRoom) {
      throw new AppError("Room number already exists for this restaurant", 400);
    }
    room.roomNumber = roomNumber;
  }

  if (floor !== undefined) {
    if (floor <= 0) {
      throw new AppError("Floor must be greater than zero", 400);
    }
    room.floor = floor;
  }

  if (status) {
    room.status = status;
  }

  if (qrAssigned !== undefined) {
    room.qrAssigned = qrAssigned;
  }

  await room.save();
  return sanitizeRoom(room);
}

export async function deleteRoom(roomId) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  await Room.findByIdAndDelete(roomId);
  return { message: "Room deleted successfully" };
}
