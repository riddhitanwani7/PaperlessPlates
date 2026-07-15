import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TableStatus } from "@/lib/api/table.api";

export function TableFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: { tableNumber: string; capacity: number; status: TableStatus } | null;
  onSubmit: (data: { tableNumber: string; capacity: number; status: TableStatus }) => Promise<void>;
  submitting?: boolean;
}) {
  const { t } = useTranslation();
  const [tableNumber, setTableNumber] = useState(initial?.tableNumber ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? 4);
  const [status, setStatus] = useState<TableStatus>(initial?.status ?? "AVAILABLE");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>{initial ? t("tables.editTable") : t("tables.addTable")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">{t("forms.number")}</Label><Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder={t("tables.tablePlaceholder")} /></div>
          <div><Label className="text-xs">{t("forms.capacity")}</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(+e.target.value)} /></div>
          <div>
            <Label className="text-xs">{t("forms.status")}</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["AVAILABLE", "OCCUPIED", "RESERVED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium ${status === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}
                >
                  {t(`status.${s.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button
            className="bg-gradient-coral"
            disabled={submitting}
            onClick={() => onSubmit({ tableNumber, capacity, status }).then(() => onOpenChange(false))}
          >
            {submitting ? t("tables.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
