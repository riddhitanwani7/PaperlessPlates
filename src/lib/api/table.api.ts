import { apiRequestAuth } from "./client";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

export type Table = {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  qrAssigned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTableRequest = {
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  status?: TableStatus;
};

export type UpdateTableRequest = {
  tableNumber?: string;
  capacity?: number;
  status?: TableStatus;
  qrAssigned?: boolean;
};

export function createTableApi(token: string, data: CreateTableRequest) {
  return apiRequestAuth<{ table: Table }>("/tables", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRestaurantTablesApi(token: string, restaurantId: string) {
  return apiRequestAuth<{ tables: Table[] }>(`/tables/restaurant/${restaurantId}`, token);
}

export function getTableByIdApi(token: string, tableId: string) {
  return apiRequestAuth<{ table: Table }>(`/tables/${tableId}`, token);
}

export function updateTableApi(token: string, tableId: string, data: UpdateTableRequest) {
  return apiRequestAuth<{ table: Table }>(`/tables/${tableId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteTableApi(token: string, tableId: string) {
  return apiRequestAuth<{ message: string }>(`/tables/${tableId}`, token, {
    method: "DELETE",
  });
}
