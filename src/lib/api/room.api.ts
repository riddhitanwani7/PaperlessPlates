import { apiRequestAuth } from "./client";

export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export type Room = {
  id: string;
  restaurantId: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  qrAssigned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateRoomRequest = {
  restaurantId: string;
  roomNumber: string;
  floor: number;
  status?: RoomStatus;
};

export type UpdateRoomRequest = {
  roomNumber?: string;
  floor?: number;
  status?: RoomStatus;
  qrAssigned?: boolean;
};

export function createRoomApi(token: string, data: CreateRoomRequest) {
  return apiRequestAuth<{ room: Room }>("/rooms", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRestaurantRoomsApi(token: string, restaurantId: string) {
  return apiRequestAuth<{ rooms: Room[] }>(`/rooms/restaurant/${restaurantId}`, token);
}

export function getRoomByIdApi(token: string, roomId: string) {
  return apiRequestAuth<{ room: Room }>(`/rooms/${roomId}`, token);
}

export function updateRoomApi(token: string, roomId: string, data: UpdateRoomRequest) {
  return apiRequestAuth<{ room: Room }>(`/rooms/${roomId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteRoomApi(token: string, roomId: string) {
  return apiRequestAuth<{ message: string }>(`/rooms/${roomId}`, token, {
    method: "DELETE",
  });
}
