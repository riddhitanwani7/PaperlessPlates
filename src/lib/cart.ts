// Customer cart store (localStorage-backed).
import { useEffect, useState } from "react";
import { getContext } from "./tableContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  notes?: string;
}

const BASE_KEY = "pp_cart";
const CART_EVENT = "pp:cart";
const CONTEXT_EVENT = "pp:context";

// Generate context-aware cart key
function getCartKey(): string {
  if (typeof window === "undefined") return BASE_KEY;
  
  const context = getContext();
  
  if (!context) return `${BASE_KEY}_restaurant`;
  
  if (context.type === "TABLE" && context.tableId) {
    return `${BASE_KEY}_table_${context.tableId}`;
  }
  
  if (context.type === "ROOM" && context.roomId) {
    return `${BASE_KEY}_room_${context.roomId}`;
  }
  
  if (context.type === "TAKEAWAY") {
    return `${BASE_KEY}_takeaway`;
  }
  
  return `${BASE_KEY}_restaurant`;
}

// Cleanup legacy cart keys
function cleanupLegacyKeys() {
  if (typeof window === "undefined") return;
  
  const context = getContext();
  const validKey = getCartKey();
  
  // Get all cart keys
  const allKeys = Object.keys(localStorage).filter(key => key.startsWith("pp_cart"));
  
  // Remove all except the current valid key
  allKeys.forEach(key => {
    if (key !== validKey && key !== BASE_KEY) {
      localStorage.removeItem(key);
    }
  });
  
  // Also remove the legacy shared cart key
  if (validKey !== BASE_KEY) {
    localStorage.removeItem(BASE_KEY);
  }
}

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCartKey();
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  const key = getCartKey();
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export const cart = {
  get: read,
  add(item: Omit<CartItem, "qty"> & { qty?: number }) {
    cleanupLegacyKeys();
    const items = read();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += item.qty ?? 1;
    } else {
      items.push({ ...item, qty: item.qty ?? 1 });
    }
    write(items);
  },
  setQty(id: string, qty: number) {
    cleanupLegacyKeys();
    const items = read()
      .map((i) => (i.id === id ? { ...i, qty } : i))
      .filter((i) => i.qty > 0);
    write(items);
  },
  remove(id: string) {
    cleanupLegacyKeys();
    write(read().filter((i) => i.id !== id));
  },
  clear() {
    cleanupLegacyKeys();
    write([]);
  },
  setNotes(id: string, notes: string) {
    cleanupLegacyKeys();
    write(read().map((i) => (i.id === id ? { ...i, notes } : i)));
  },
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    cleanupLegacyKeys();
    setItems(read());
    const onCartChange = () => {
      cleanupLegacyKeys();
      setItems(read());
    };
    const onContextChange = () => {
      cleanupLegacyKeys();
      setItems(read());
    };
    window.addEventListener(CART_EVENT, onCartChange);
    window.addEventListener(CONTEXT_EVENT, onContextChange);
    window.addEventListener("storage", onCartChange);
    return () => {
      window.removeEventListener(CART_EVENT, onCartChange);
      window.removeEventListener(CONTEXT_EVENT, onContextChange);
      window.removeEventListener("storage", onCartChange);
    };
  }, []);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { items, subtotal, tax, total, count, ...cart };
}
