import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { QRPrintDesign } from "./QRPrintDesign";

export function QRImage({
  value,
  size = 160,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, { width: size, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } });
  }, [value, size]);
  return <canvas ref={ref} className={cn("rounded-xl bg-white", className)} width={size} height={size} />;
}

export async function downloadQRPng(value: string, name: string) {
  const dataUrl = await QRCode.toDataURL(value, { width: 1024, margin: 2 });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${name}.png`;
  a.click();
}

export function downloadQRImage(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.png`;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.click();
}

export async function downloadQRSvg(value: string, name: string) {
  const svg = await QRCode.toString(value, { type: "svg", margin: 2 });
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printQR(value: string, label: string, imageUrl?: string) {
  const w = window.open("", "_blank", "width=400,height=600");
  if (!w) return;

  const render = (data: string) => {
    w.document.write(`
      <html><head><title>${label}</title>
      <style>body{font-family:system-ui;text-align:center;padding:40px}
      h1{font-size:24px;margin:0 0 8px}p{color:#666;margin:0 0 24px}
      img{width:300px;height:300px}</style></head>
      <body><h1>${label}</h1><p>Scan to view the menu</p>
      <img src="${data}" /><script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  if (imageUrl) {
    render(imageUrl);
    return;
  }

  QRCode.toDataURL(value, { width: 400, margin: 2 }).then(render);
}

export function QRPrintDesignWrapper({
  restaurantName,
  tableLabel,
  qrUrl,
  onImageGenerated,
}: {
  restaurantName: string;
  tableLabel?: string;
  qrUrl: string;
  onImageGenerated: (dataUrl: string) => void;
}) {
  return (
    <QRPrintDesign
      restaurantName={restaurantName}
      tableLabel={tableLabel}
      qrUrl={qrUrl}
      onImageGenerated={onImageGenerated}
    />
  );
}
