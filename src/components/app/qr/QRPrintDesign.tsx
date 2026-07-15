import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRPrintDesignProps {
  restaurantName: string;
  tableLabel?: string;
  qrUrl: string;
  onImageGenerated?: (dataUrl: string) => void;
}

export function QRPrintDesign({ restaurantName, tableLabel, qrUrl, onImageGenerated }: QRPrintDesignProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function generateDesign() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size (A4 compatible at 300 DPI)
      canvas.width = 2480;
      canvas.height = 3508;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restaurant name (large, bold, centered)
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 80px Arial";
      ctx.textAlign = "center";
      ctx.fillText(restaurantName.toUpperCase(), canvas.width / 2, 400);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 1200,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      });

      const qrImage = new Image();
      qrImage.onload = () => {
        // Draw QR code (centered)
        const qrX = (canvas.width - 1200) / 2;
        const qrY = 600;
        ctx.drawImage(qrImage, qrX, qrY, 1200, 1200);

        // Table label (if provided)
        if (tableLabel) {
          ctx.fillStyle = "#1a1a1a";
          ctx.font = "bold 60px Arial";
          ctx.fillText(tableLabel.toUpperCase(), canvas.width / 2, 1950);
        }

        // Subtitle
        ctx.fillStyle = "#666666";
        ctx.font = "40px Arial";
        ctx.fillText("Scan to View Menu & Order", canvas.width / 2, 2100);

        // Footer
        ctx.fillStyle = "#999999";
        ctx.font = "30px Arial";
        ctx.fillText("Powered by PaperlessPlates", canvas.width / 2, canvas.height - 200);

        // Export as data URL
        const dataUrl = canvas.toDataURL("image/png");
        onImageGenerated?.(dataUrl);
      };
      qrImage.src = qrDataUrl;
    }

    generateDesign();
  }, [restaurantName, tableLabel, qrUrl, onImageGenerated]);

  return <canvas ref={canvasRef} className="hidden" />;
}
