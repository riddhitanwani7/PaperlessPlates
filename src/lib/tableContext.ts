const CONTEXT_KEY = "pp_table_context";
const CONTEXT_EVENT = "pp:context";

export type QRContext = {
  type: "TABLE" | "ROOM" | "TAKEAWAY" | "RESTAURANT";
  tableId?: string;
  roomId?: string;
};

// Get context from localStorage
export function getContext(): QRContext | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(CONTEXT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  return null;
}

// Set context
export function setContext(context: QRContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  window.dispatchEvent(new Event(CONTEXT_EVENT));
}

// Clear context
export function clearContext() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONTEXT_KEY);
  window.dispatchEvent(new Event(CONTEXT_EVENT));
}

// Get context type
export function getContextType(): "TABLE" | "ROOM" | "TAKEAWAY" | "RESTAURANT" | null {
  const context = getContext();
  return context?.type || null;
}

// Get display label for context
export function getContextLabel(): string {
  const context = getContext();
  if (!context) return "Restaurant";

  switch (context.type) {
    case "TABLE":
      return context.tableId ? `Table ${context.tableId}` : "Table";
    case "ROOM":
      return context.roomId ? `Room ${context.roomId}` : "Room";
    case "TAKEAWAY":
      return "Takeaway";
    case "RESTAURANT":
      return "Restaurant";
    default:
      return "Restaurant";
  }
}

// Legacy functions for backward compatibility
export function getTableContext() {
  const context = getContext();
  if (!context) return {};

  const legacy: { tableId?: string; roomId?: string; takeaway?: boolean } = {};
  if (context.type === "TABLE" && context.tableId) {
    legacy.tableId = context.tableId;
  }
  if (context.type === "ROOM" && context.roomId) {
    legacy.roomId = context.roomId;
  }
  if (context.type === "TAKEAWAY") {
    legacy.takeaway = true;
  }

  return legacy;
}

export function setTableContext(context: { tableId?: string; roomId?: string; takeaway?: boolean }) {
  // DEPRECATED: This function should not be used.
  // Context should only be set by restaurant.$slug.tsx when scanning a QR code.
  // Cart operations must never modify QR context.
  console.warn("setTableContext is deprecated and should not be called. Context should only be set by restaurant.$slug.tsx");
  // Do nothing to prevent context mutation
}

export function clearTableContext() {
  // DEPRECATED: This function should not be used.
  // Context should only be cleared by explicit session reset.
  // Cart operations must never clear QR context.
  console.warn("clearTableContext is deprecated and should not be called. Context should only be cleared by explicit session reset");
  // Do nothing to prevent context mutation
}

export function getTableLabel() {
  return getContextLabel();
}
