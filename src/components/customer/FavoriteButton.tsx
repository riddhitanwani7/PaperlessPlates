import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/personalization";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, size = "sm" }: { id: string; size?: "sm" | "md" }) {
  const { has, toggle } = useFavorites();
  const fav = has(id);
  const dim = size === "md" ? "h-9 w-9" : "h-7 w-7";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      className={cn(dim, "grid place-items-center rounded-full border border-border bg-card hover:bg-muted")}
    >
      <Heart
        className={cn(
          size === "md" ? "h-4 w-4" : "h-3.5 w-3.5",
          fav ? "fill-primary text-primary" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
