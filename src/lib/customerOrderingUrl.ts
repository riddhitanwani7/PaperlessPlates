import type { QREntity } from "@/lib/types/qr";

export function getCustomerOrderingUrl(qr: QREntity) {
  const url = new URL("/customer/menu", window.location.origin);

  url.searchParams.set("slug", qr.slug);

  if (qr.type === "Table" && qr.tableId) {
    url.searchParams.set("table", qr.tableId);
  } else if (qr.type === "Room" && qr.roomId) {
    url.searchParams.set("room", qr.roomId);
  } else if (qr.type === "Takeaway") {
    url.searchParams.set("takeaway", "true");
  }

  return url.toString();
}
