// Customer personalization helpers (localStorage-backed).
import { useEffect, useState } from "react";

const FAV_KEY = "pp_favorites";
const RECENT_KEY = "pp_recent_orders";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(`pp:${key}`));
}

export const favorites = {
  get: () => read(FAV_KEY),
  toggle(id: string) {
    const list = read(FAV_KEY);
    write(
      FAV_KEY,
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  },
  has: (id: string) => read(FAV_KEY).includes(id),
};

export const recent = {
  get: () => read(RECENT_KEY),
  push(ids: string[]) {
    const merged = Array.from(new Set([...ids, ...read(RECENT_KEY)])).slice(0, 12);
    write(RECENT_KEY, merged);
  },
};

export function useFavorites() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(favorites.get());
    const onChange = () => setList(favorites.get());
    window.addEventListener(`pp:${FAV_KEY}`, onChange);
    return () => window.removeEventListener(`pp:${FAV_KEY}`, onChange);
  }, []);
  return { list, has: (id: string) => list.includes(id), toggle: favorites.toggle };
}

export function useRecent() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(recent.get());
    const onChange = () => setList(recent.get());
    window.addEventListener(`pp:${RECENT_KEY}`, onChange);
    return () => window.removeEventListener(`pp:${RECENT_KEY}`, onChange);
  }, []);
  return list;
}
