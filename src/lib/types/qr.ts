export type QREntity = {
  id: string;
  restaurantId: string;
  slug: string;
  label: string;
  type: "Restaurant" | "Table" | "Room" | "Takeaway";
  url: string;
  qrUrl: string;
  qrImageUrl: string;
  active: boolean;
  scans: number;
  lastScannedAt?: string;
  tableId?: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
};
