import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function GenerateQRDialog({
  open,
  onOpenChange,
  onGenerate,
  tableNumbers,
  roomNumbers,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGenerate: (data: { type: "Table" | "Room" | "Restaurant" | "Takeaway"; label: string }) => void;
  tableNumbers: string[];
  roomNumbers: string[];
}) {
  const { t } = useTranslation();
  const [type, setType] = useState<"Table" | "Room" | "Restaurant" | "Takeaway">("Table");
  const [label, setLabel] = useState("");
  const locationNumbers = useMemo(
    () => (type === "Table" ? tableNumbers : type === "Room" ? roomNumbers : []),
    [roomNumbers, tableNumbers, type],
  );

  useEffect(() => {
    setLabel("");
  }, [type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("qr.generateTitle")}</DialogTitle>
        </DialogHeader>
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
          {type === "Table" || type === "Room" ? (
            <div>
              <Label className="text-xs">
                {type === "Table" ? t("orderType.TABLE") : t("orderType.ROOM")}
              </Label>
              <select
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="" disabled>
                  {locationNumbers.length
                    ? type === "Table"
                      ? t("qr.tablePlaceholder")
                      : t("qr.roomPlaceholder")
                    : "Create a matching table or room first"}
                </option>
                {locationNumbers.map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("qr.mainMenuLabel")}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            className="bg-gradient-coral"
            onClick={() => {
              onGenerate({ type, label });
              onOpenChange(false);
              setLabel("");
            }}
            disabled={(type === "Table" || type === "Room") && !label}
          >
            {t("qr.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
