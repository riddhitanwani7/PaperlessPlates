import { cn } from "@/lib/utils";

export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="sticky top-[57px] z-20 -mx-4 mb-2 overflow-x-auto border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
      <div className="flex gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
