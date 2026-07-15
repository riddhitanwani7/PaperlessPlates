import type { RestaurantTheme } from "@/lib/api/restaurant.api";

export type CustomerThemeData = {
  restaurantName: string;
  description: string;
  logoUrl: string;
  theme: RestaurantTheme;
  settings?: {
    currency: string;
    language: "en" | "hi";
    dateFormat?: string;
    timezone?: string;
  };
};

// Helper to convert hex to oklch (simplified - in production use a proper library)
function hexToOklch(hex: string): string {
  // For now, return hex directly - browsers support hex in CSS custom properties
  // In production, convert to oklch for better color manipulation
  return hex;
}

export function applyThemeToElement(el: HTMLElement, theme: RestaurantTheme) {
  // Apply theme colors to CSS custom properties
  // These override the default :root values
  el.style.setProperty("--primary", theme.primaryColor);
  el.style.setProperty("--ring", theme.primaryColor);
  el.style.setProperty("--primary-soft", adjustOpacity(theme.primaryColor, 0.1));
  el.style.setProperty("--primary-foreground", getContrastColor(theme.primaryColor));
  
  el.style.setProperty("--secondary", theme.secondaryColor);
  el.style.setProperty("--secondary-foreground", getContrastColor(theme.secondaryColor));
  
  el.style.setProperty("--accent", theme.accentColor);
  el.style.setProperty("--accent-foreground", getContrastColor(theme.accentColor));
  
  // Create dynamic gradient based on primary color
  const primaryLight = adjustOpacity(theme.primaryColor, 0.3);
  el.style.setProperty("--gradient-primary", `linear-gradient(135deg, ${theme.primaryColor} 0%, ${primaryLight} 100%)`);
  
  if (theme.borderRadius) {
    el.style.setProperty("--radius", theme.borderRadius);
  }

  // Apply dark mode class
  if (theme.mode === "dark") {
    el.classList.add("dark");
  } else {
    el.classList.remove("dark");
  }

  // Apply font family if specified
  if (theme.fontFamily) {
    el.style.setProperty("--font-sans", theme.fontFamily);
  }
}

function getContrastColor(hex: string): string {
  // Simple contrast calculation - return white for dark colors, black for light
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function adjustOpacity(hex: string, opacity: number): string {
  // Simple hex to rgba conversion
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const THEME_PRESETS = [
  { name: "Coral", primaryColor: "#f97316", secondaryColor: "#1e293b", accentColor: "#fb923c" },
  { name: "Forest", primaryColor: "#16a34a", secondaryColor: "#14532d", accentColor: "#22c55e" },
  { name: "Ocean", primaryColor: "#2563eb", secondaryColor: "#1e3a8a", accentColor: "#3b82f6" },
  { name: "Plum", primaryColor: "#9333ea", secondaryColor: "#581c87", accentColor: "#a855f7" },
  { name: "Saffron", primaryColor: "#eab308", secondaryColor: "#713f12", accentColor: "#facc15" },
] as const;

export const FONT_OPTIONS = [
  "Inter",
  "Instrument Serif",
  "Playfair Display",
  "DM Serif Display",
] as const;
