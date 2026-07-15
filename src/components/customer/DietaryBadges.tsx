import { Leaf, Wheat, Flame, Star } from "lucide-react";

const MAP: Record<string, { label: string; icon: typeof Leaf; cls: string }> = {
  Vegetarian: { label: "Veg", icon: Leaf, cls: "bg-emerald-100 text-emerald-700" },
  Vegan: { label: "Vegan", icon: Leaf, cls: "bg-emerald-100 text-emerald-700" },
  "Gluten-free": { label: "GF", icon: Wheat, cls: "bg-amber-100 text-amber-700" },
  Spicy: { label: "Spicy", icon: Flame, cls: "bg-red-100 text-red-700" },
  Signature: { label: "Signature", icon: Star, cls: "bg-primary-soft text-primary" },
  "Contains alcohol": { label: "18+", icon: Star, cls: "bg-muted text-foreground/70" },
};

export function DietaryBadges({ tags }: { tags: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => {
        const conf = MAP[t] ?? { label: t, icon: Star, cls: "bg-muted text-foreground/70" };
        const Icon = conf.icon;
        return (
          <span
            key={t}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${conf.cls}`}
          >
            <Icon className="h-3 w-3" />
            {conf.label}
          </span>
        );
      })}
    </div>
  );
}
