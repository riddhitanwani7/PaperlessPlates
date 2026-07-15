export function parseDietaryTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return trimmed.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  }
  return [];
}

export function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

export function parseNumber(value, fieldName) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  return num;
}
