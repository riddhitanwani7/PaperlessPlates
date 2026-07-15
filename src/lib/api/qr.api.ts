import { apiRequestAuth } from "./client";
import type { QREntity } from "@/lib/types/qr";

export function getMyQRApi(token: string) {
  return apiRequestAuth<{ qrs: QREntity[] }>("/qr", token);
}

export function generateQRApi(token: string, data: { type: "Restaurant" | "Table" | "Room" | "Takeaway"; tableId?: string; roomId?: string }) {
  return apiRequestAuth<{ qr: QREntity }>("/qr/generate", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getQRByIdApi(token: string, id: string) {
  return apiRequestAuth<{ qr: QREntity }>(`/qr/${id}`, token);
}

export function updateQRApi(token: string, id: string, active: boolean) {
  return apiRequestAuth<{ qr: QREntity }>(`/qr/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export function deleteQRApi(token: string, id: string) {
  return apiRequestAuth<{ message: string }>(`/qr/${id}`, token, { method: "DELETE" });
}
