import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRPrintDesign } from "./QRPrintDesign";
import type { QREntity } from "@/lib/types/qr";

export function QRPreviewDialog({
  qr,
  qrUrl,
  open,
  onOpenChange,
}: {
  qr: QREntity;
  qrUrl: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const tableLabel = qr.type === "Table" ? `TABLE ${qr.tableId || ""}` 
                  : qr.type === "Room" ? `ROOM ${qr.roomId || ""}`
                  : qr.type === "Takeaway" ? "TAKEAWAY"
                  : "MAIN MENU";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{qr.label}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <QRPrintDesign
            restaurantName={qr.label}
            tableLabel={tableLabel}
            qrUrl={qrUrl}
            onImageGenerated={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
