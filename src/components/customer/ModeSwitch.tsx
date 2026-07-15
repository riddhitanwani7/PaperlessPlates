import { cn } from "@/lib/utils";

export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: "TABLE" | "DIGITAL";
  onChange: (mode: "TABLE" | "DIGITAL") => void;
}) {
  return (
    <div className="mx-4 mb-4 flex rounded-full border border-border bg-card p-1">
      <button
        onClick={() => onChange("TABLE")}
        className={cn(
          "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          mode === "TABLE"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        TABLE
      </button>
      <button
        onClick={() => onChange("DIGITAL")}
        className={cn(
          "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          mode === "DIGITAL"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        DIGITAL MENU
      </button>
    </div>
  );
}
