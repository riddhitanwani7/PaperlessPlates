import { Table } from "../models/Table.js";
import { Restaurant } from "../models/Restaurant.js";
import { AppError } from "../utils/AppError.js";

function sanitizeTable(table) {
  return {
    id: table._id,
    restaurantId: table.restaurantId,
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    status: table.status,
    qrAssigned: table.qrAssigned,
    createdAt: table.createdAt,
    updatedAt: table.updatedAt,
  };
}

export async function createTable(tableData) {
  const { restaurantId, tableNumber, capacity, status } = tableData;

  // Validate input
  if (!restaurantId) {
    throw new AppError("Restaurant ID is required", 400);
  }
  if (!tableNumber) {
    throw new AppError("Table number is required", 400);
  }
  if (!capacity || capacity <= 0) {
    throw new AppError("Capacity must be greater than zero", 400);
  }

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  // Check if table number already exists for this restaurant
  const existingTable = await Table.findOne({ restaurantId, tableNumber });
  if (existingTable) {
    throw new AppError("Table number already exists for this restaurant", 400);
  }

  const table = new Table({
    restaurantId,
    tableNumber,
    capacity,
    status: status || "AVAILABLE",
    qrAssigned: false,
  });

  await table.save();
  return sanitizeTable(table);
}

export async function getTablesByRestaurant(restaurantId) {
  const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });
  return tables.map(sanitizeTable);
}

export async function getTableById(tableId) {
  const table = await Table.findById(tableId);
  if (!table) {
    throw new AppError("Table not found", 404);
  }
  return sanitizeTable(table);
}

export async function updateTable(tableId, updateData) {
  const { tableNumber, capacity, status, qrAssigned } = updateData;

  const table = await Table.findById(tableId);
  if (!table) {
    throw new AppError("Table not found", 404);
  }

  // If updating table number, check for duplicates
  if (tableNumber && tableNumber !== table.tableNumber) {
    const existingTable = await Table.findOne({
      restaurantId: table.restaurantId,
      tableNumber,
    });
    if (existingTable) {
      throw new AppError("Table number already exists for this restaurant", 400);
    }
    table.tableNumber = tableNumber;
  }

  if (capacity !== undefined) {
    if (capacity <= 0) {
      throw new AppError("Capacity must be greater than zero", 400);
    }
    table.capacity = capacity;
  }

  if (status) {
    table.status = status;
  }

  if (qrAssigned !== undefined) {
    table.qrAssigned = qrAssigned;
  }

  await table.save();
  return sanitizeTable(table);
}

export async function deleteTable(tableId) {
  const table = await Table.findById(tableId);
  if (!table) {
    throw new AppError("Table not found", 404);
  }

  await Table.findByIdAndDelete(tableId);
  return { message: "Table deleted successfully" };
}
