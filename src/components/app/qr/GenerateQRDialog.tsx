import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GenerateQRDialog({
  open,
  onOpenChange,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGenerate: (data: { type: "Table" | "Room" | "Restaurant" | "Takeaway"; label: string; bulkFrom?: number; bulkTo?: number }) => void;
}) {
  const [type, setType] = useState<"Table" | "Room" | "Restaurant" | "Takeaway">("Table");
  const [label, setLabel] = useState("");
  const [bulk, setBulk] = useState(false);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>Generate QR code</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Type</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(["Restaurant", "Table", "Room", "Takeaway"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium ${type === t ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {(type === "Table" || type === "Room") && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bulk} onChange={(e) => setBulk(e.target.checked)} />
              Generate in bulk
            </label>
          )}
          {bulk ? (
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">From</Label><Input type="number" value={from} onChange={(e) => setFrom(+e.target.value)} /></div>
              <div><Label className="text-xs">To</Label><Input type="number" value={to} onChange={(e) => setTo(+e.target.value)} /></div>
            </div>
          ) : (
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={type === "Table" ? "Table 07" : type === "Room" ? "Room 215" : "Main menu"} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-gradient-coral"
            onClick={() => {
              onGenerate(bulk ? { type, label: "", bulkFrom: from, bulkTo: to } : { type, label });
              onOpenChange(false);
              setLabel("");
            }}
          >
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
