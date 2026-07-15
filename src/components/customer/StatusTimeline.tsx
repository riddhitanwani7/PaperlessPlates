import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Placed", "Accepted", "Preparing", "Ready", "Completed"] as const;
export type TimelineStatus = (typeof STEPS)[number];

export function StatusTimeline({ current }: { current: TimelineStatus }) {
  const idx = STEPS.indexOf(current);
  return (
    <ol className="space-y-3">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border-2",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary-soft text-primary animate-pulse",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : active ? <Clock className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
            </div>
            <div className="flex-1 pt-0.5">
              <p className={cn("text-sm font-medium", !done && !active && "text-muted-foreground")}>{s}</p>
              {active && <p className="text-xs text-muted-foreground">In progress…</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
