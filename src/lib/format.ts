export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, dateFormat = "DD/MM/YYYY", timezone = "Asia/Kolkata") {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);

  const map: Record<string, string> = {};
  parts.forEach((p) => {
    if (p.type !== "literal") map[p.type] = p.value;
  });

  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${map.month}/${map.day}/${map.year}`;
    case "YYYY-MM-DD":
      return `${map.year}-${map.month}-${map.day}`;
    default:
      return `${map.day}/${map.month}/${map.year}`;
  }
}

export function formatTime(date: string | Date, timezone = "Asia/Kolkata") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPercentChange(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function orderLocationLabel(order: {
  orderType: string;
  tableId?: string | null;
  roomId?: string | null;
}) {
  if (order.orderType === "TABLE" && order.tableId) return `Table ${order.tableId}`;
  if (order.orderType === "ROOM" && order.roomId) return `Room ${order.roomId}`;
  return order.orderType;
}
