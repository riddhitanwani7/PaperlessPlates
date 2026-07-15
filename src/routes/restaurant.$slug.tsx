import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { getPublicRestaurantApi, recordScanApi } from "@/lib/api/public.api";
import { setRestaurantSlug } from "@/lib/restaurantSlug";
import { applyThemeToElement } from "@/lib/restaurantTheme";
import { setContext, type QRContext } from "@/lib/tableContext";
import { getCustomerSessionId } from "@/lib/customerSession";

export const Route = createFileRoute("/restaurant/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Menu` }],
  }),
  component: EntryPage,
});

function EntryPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function initializeAndRedirect() {
      try {
        // Generate customer session if missing
        getCustomerSessionId();

        // Fetch restaurant
        const { restaurant: data } = await getPublicRestaurantApi(slug);
        
        // Store restaurant slug
        setRestaurantSlug(slug);

        // Apply restaurant theme to document
        if (data.theme) {
          applyThemeToElement(document.documentElement, data.theme);
        }

        localStorage.setItem("pp_customer_restaurant_info", JSON.stringify({
          restaurantName: data.restaurantName,
          description: data.description,
          logoUrl: data.logoUrl,
          theme: data.theme,
          settings: data.settings,
          onlinePaymentsEnabled: data.onlinePaymentsEnabled,
        }));

        if (data.settings?.language) {
          const { setAppLanguage } = await import("@/i18n");
          setAppLanguage(data.settings.language);
        }
        
        // Store restaurant ID for customer order creation
        if (data.id) {
          localStorage.setItem("pp_customer_restaurant_id", data.id);
        }
        
        // Parse URL params to determine context
        const urlParams = new URLSearchParams(window.location.search);
        const tableId = urlParams.get("table");
        const roomId = urlParams.get("room");
        const takeaway = urlParams.get("takeaway") === "true";
        
        // Store context based on URL params
        let context: QRContext;
        if (tableId) {
          context = { type: "TABLE", tableId };
        } else if (roomId) {
          context = { type: "ROOM", roomId };
        } else if (takeaway) {
          context = { type: "TAKEAWAY" };
        } else {
          context = { type: "RESTAURANT" };
        }
        
        setContext(context);
        
        // Record scan (non-blocking)
        void recordScanApi(slug).catch(() => {
          // Scan tracking should not block the redirect.
        });
        
        // Redirect to customer menu
        navigate({ to: "/customer/menu", replace: true });
      } catch (err) {
        console.error("Failed to initialize restaurant:", err);
        // On error, still redirect to menu with error handling
        navigate({ to: "/customer/menu", replace: true });
      }
    }

    initializeAndRedirect();
  }, [slug, navigate]);

  // Show loading while initializing
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading restaurant...</p>
      </div>
    </div>
  );
}
