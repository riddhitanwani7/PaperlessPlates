import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { QREntity } from "@/lib/types/qr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRImage, downloadQRSvg } from "./QRImage";
import { Eye, Download, Printer, Copy, Power } from "lucide-react";
import { QRPreviewDialog } from "./QRPreviewDialog";
import { QRPrintDesign } from "./QRPrintDesign";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QRCard({
  qr,
  onToggle,
}: {
  qr: QREntity;
  onToggle: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [printDataUrl, setPrintDataUrl] = useState<string | null>(null);

  const tableLabel =
    qr.type === "Table"
      ? t("orders.tableLocation", { id: qr.tableId || "" })
      : qr.type === "Room"
        ? t("orders.roomLocation", { id: qr.roomId || "" })
        : qr.type === "Takeaway"
          ? t("orderType.TAKEAWAY")
          : t("qr.mainMenuLabel");

  const handleDownloadPrint = (dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${qr.label}-qr.png`;
    a.click();
  };

  const handlePrint = (dataUrl: string) => {
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;

    w.document.write(`
      <html><head><title>${qr.label}</title>
      <style>
        body { font-family: system-ui; text-align: center; padding: 40px; margin: 0; }
        .container { max-width: 400px; margin: 0 auto; }
        .restaurant-name { font-size: 32px; font-weight: bold; margin: 0 0 20px; }
        .qr-container { margin: 20px 0; }
        .qr-container img { width: 300px; height: 300px; }
        .table-label { font-size: 24px; font-weight: bold; margin: 20px 0; }
        .subtitle { font-size: 16px; color: #666; margin: 10px 0; }
        .footer { font-size: 12px; color: #999; margin-top: 40px; }
      </style>
      </head>
      <body>
        <div class="container">
          <h1 class="restaurant-name">${qr.label.toUpperCase()}</h1>
          <div class="qr-container">
            <img src="${dataUrl}" />
          </div>
          <div class="table-label">${tableLabel}</div>
          <div class="subtitle">${t("qr.scanToViewMenu")}</div>
          <div class="footer">${t("qr.poweredBy")}</div>
        </div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Card className="flex flex-col rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-base leading-tight">{qr.label}</p>
          <p className="text-xs text-muted-foreground">
            {t(`orderType.${qr.type.toUpperCase()}`)} • {qr.scans} {t("qr.scans")}
          </p>
        </div>
        <Badge className={qr.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
          {qr.active ? t("status.active") : t("status.inactive")}
        </Badge>
      </div>
      <div className="my-4 -m-4 overflow-hidden opacity-0 pointer-events-none absolute">
        <QRPrintDesign
          restaurantName={qr.label}
          tableLabel={tableLabel}
          qrUrl={qr.url}
          onImageGenerated={setPrintDataUrl}
        />
      </div>
      <div className="my-4 grid place-items-center rounded-xl bg-muted p-4">
        {qr.qrImageUrl ? (
          <img
            src={qr.qrImageUrl}
            alt={t("qr.imageAlt", { label: qr.label })}
            className="rounded-xl bg-white"
            width={140}
            height={140}
          />
        ) : (
          <QRImage value={qr.url} size={140} />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" /> {t("qr.preview")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" /> {t("qr.download")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                if (printDataUrl) {
                  handleDownloadPrint(printDataUrl);
                } else {
                  toast.error(t("qr.designNotReady"));
                }
              }}
            >
              {t("qr.pngPrintDesign")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadQRSvg(qr.url, qr.label)}>{t("qr.svg")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (printDataUrl) {
              handlePrint(printDataUrl);
            } else {
              toast.error(t("qr.designNotReady"));
            }
          }}
        >
          <Printer className="mr-1.5 h-3.5 w-3.5" /> {t("qr.print")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(qr.url);
            toast.success(t("qr.urlCopied"));
          }}
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" /> {t("qr.copyUrl")}
        </Button>
      </div>
      <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => onToggle(qr.id)}>
        <Power className="mr-1.5 h-3.5 w-3.5" />
        {qr.active ? t("qr.deactivate") : t("qr.activate")}
      </Button>
      <QRPreviewDialog qr={qr} open={open} onOpenChange={setOpen} />
    </Card>
  );
}
