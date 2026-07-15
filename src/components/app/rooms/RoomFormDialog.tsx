import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoomStatus } from "@/lib/api/room.api";

export function RoomFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: { roomNumber: string; floor: number; status: RoomStatus } | null;
  onSubmit: (data: { roomNumber: string; floor: number; status: RoomStatus }) => Promise<void>;
  submitting?: boolean;
}) {
  const [roomNumber, setRoomNumber] = useState(initial?.roomNumber ?? "");
  const [floor, setFloor] = useState(initial?.floor ?? 1);
  const [status, setStatus] = useState<RoomStatus>(initial?.status ?? "AVAILABLE");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>{initial ? "Edit room" : "Add room"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Room number</Label><Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="215" /></div>
          <div><Label className="text-xs">Floor</Label><Input type="number" value={floor} onChange={(e) => setFloor(+e.target.value)} /></div>
          <div>
            <Label className="text-xs">Status</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["AVAILABLE", "OCCUPIED", "MAINTENANCE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium ${status === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-gradient-coral"
            disabled={submitting}
            onClick={() => onSubmit({ roomNumber, floor, status }).then(() => onOpenChange(false))}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
