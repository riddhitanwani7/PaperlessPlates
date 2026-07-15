import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [type, setType] = useState<"Table" | "Room" | "Restaurant" | "Takeaway">("Table");
  const [label, setLabel] = useState("");
  const [bulk, setBulk] = useState(false);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>{t("qr.generateTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">{t("forms.type")}</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(["Restaurant", "Table", "Room", "Takeaway"] as const).map((typeOption) => (
                <button
                  key={typeOption}
                  onClick={() => setType(typeOption)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium ${type === typeOption ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}
                >
                  {typeOption === "Restaurant"
                    ? t("orderType.RESTAURANT")
                    : typeOption === "Table"
                      ? t("orderType.TABLE")
                      : typeOption === "Room"
                        ? t("orderType.ROOM")
                        : t("orderType.TAKEAWAY")}
                </button>
              ))}
            </div>
          </div>
          {(type === "Table" || type === "Room") && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bulk} onChange={(e) => setBulk(e.target.checked)} />
              {t("qr.generateInBulk")}
            </label>
          )}
          {bulk ? (
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">{t("forms.from")}</Label><Input type="number" value={from} onChange={(e) => setFrom(+e.target.value)} /></div>
              <div><Label className="text-xs">{t("forms.to")}</Label><Input type="number" value={to} onChange={(e) => setTo(+e.target.value)} /></div>
            </div>
          ) : (
            <div>
              <Label className="text-xs">{t("forms.label")}</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={type === "Table" ? t("qr.tablePlaceholder") : type === "Room" ? t("qr.roomPlaceholder") : t("qr.mainMenuPlaceholder")} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button
            className="bg-gradient-coral"
            onClick={() => {
              onGenerate(bulk ? { type, label: "", bulkFrom: from, bulkTo: to } : { type, label });
              onOpenChange(false);
              setLabel("");
            }}
          >
            {t("qr.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
