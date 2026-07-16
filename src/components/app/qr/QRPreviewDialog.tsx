import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QRPrintDesign } from "./QRPrintDesign";
import type { QREntity } from "@/lib/types/qr";

export function QRPreviewDialog({
  qr,
  qrUrl,
  restaurantName,
  open,
  onOpenChange,
}: {
  qr: QREntity;
  qrUrl: string;
  restaurantName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const tableLabel =
    qr.type === "Table"
      ? `TABLE ${qr.tableId || ""}`
      : qr.type === "Room"
        ? `ROOM ${qr.roomId || ""}`
        : qr.type === "Takeaway"
          ? "TAKEAWAY"
          : "MAIN MENU";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>{restaurantName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{tableLabel}</span>
            <Badge
              className={
                qr.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
              }
            >
              {qr.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <QRPrintDesign
            restaurantName={qr.label}
            tableLabel={tableLabel}
            qrUrl={qrUrl}
            onImageGenerated={() => {}}
            className="h-auto w-full rounded-xl border bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
