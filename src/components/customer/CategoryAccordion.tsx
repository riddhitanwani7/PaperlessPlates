import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryAccordion({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2 px-4 py-3">
      {categories.map((category) => {
        const isExpanded = expanded === category;
        const isActive = active === category;
        
        return (
          <div key={category} className="rounded-xl border border-border bg-card">
            <button
              onClick={() => {
                setExpanded(isExpanded ? null : category);
                onChange(category);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className={cn(
                "font-medium",
                isActive ? "text-primary" : "text-foreground"
              )}>
                {category}
              </span>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
