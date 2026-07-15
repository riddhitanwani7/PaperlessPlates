import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRestaurantTablesApi } from "@/lib/api/table.api";
import { getRestaurantRoomsApi } from "@/lib/api/room.api";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { setContext } from "@/lib/tableContext";
import { setRestaurantSlug } from "@/lib/restaurantSlug";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  context: z.enum(["restaurant", "table", "room", "takeaway"]).optional(),
});

export const Route = createFileRoute("/app/preview")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Customer Preview — PaperlessPlates" }] }),
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER"]}>
      <PreviewPage />
    </RoleGuard>
  ),
});

type PreviewContext = "restaurant" | "table" | "room" | "takeaway";

function PreviewPage() {
  const { t } = useTranslation();
  const { restaurant, loading } = useRestaurant();
  const [context, setPreviewContext] = useState<PreviewContext>("restaurant");
  const [tableId, setTableId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [tables, setTables] = useState<{ id: string; tableNumber: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; roomNumber: string }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const token = auth.getToken();
      const restaurantId =
        auth.getUser()?.restaurantId ?? localStorage.getItem("pp_owner_restaurant_id");
      if (!token || !restaurantId) return;
      try {
        const [{ tables: tablesData }, { rooms: roomsData }] = await Promise.all([
          getRestaurantTablesApi(token, restaurantId),
          getRestaurantRoomsApi(token, restaurantId),
        ]);
        setTables(tablesData.map((tbl) => ({ id: tbl.id, tableNumber: tbl.tableNumber })));
        setRooms(roomsData.map((rm) => ({ id: rm.id, roomNumber: rm.roomNumber })));
        if (tablesData[0]) setTableId(tablesData[0].id);
        if (roomsData[0]) setRoomId(roomsData[0].id);
      } catch {
        // Preview still works without table/room lists
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (!restaurant?.slug || !restaurant.theme) return;

    setRestaurantSlug(restaurant.slug);

    // Apply restaurant theme to preview page UI
    if (restaurant.theme) {
      localStorage.setItem("pp_customer_restaurant_info", JSON.stringify({
        restaurantName: restaurant.restaurantName ?? "",
        description: restaurant.description ?? "",
        logoUrl: restaurant.logoUrl ?? "",
        theme: restaurant.theme,
        settings: restaurant.settings,
        onlinePaymentsEnabled: restaurant.paymentSettings?.provider
          ? (restaurant.paymentSettings.paymentsEnabled && !!(restaurant.paymentSettings.keyId && restaurant.paymentSettings.encryptedKeySecret))
          : true,
      }));
    }

    if (context === "table" && tableId) {
      setContext({ type: "TABLE", tableId });
    } else if (context === "room" && roomId) {
      setContext({ type: "ROOM", roomId });
    } else if (context === "takeaway") {
      setContext({ type: "TAKEAWAY" });
    } else {
      setContext({ type: "RESTAURANT" });
    }

    setReady(true);
  }, [restaurant, context, tableId, roomId]);

  const iframeSrc = useMemo(() => {
    if (!restaurant?.slug) return null;
    return `/customer/menu?slug=${encodeURIComponent(restaurant.slug)}&preview=1`;
  }, [restaurant?.slug, ready]);

  if (loading || !restaurant) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const contexts: { id: PreviewContext; label: string }[] = [
    { id: "restaurant", label: t("preview.restaurant") },
    { id: "table", label: t("preview.table") },
    { id: "room", label: t("preview.room") },
    { id: "takeaway", label: t("preview.takeaway") },
  ];

  return (
    <>
      <PageHeader
        title={t("preview.title")}
        description={t("preview.description")}
        actions={
          restaurant.slug ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`/restaurant/${restaurant.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("preview.openPreview")}
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-card lg:col-span-1">
          <h3 className="font-semibold">{t("preview.context")}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {contexts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPreviewContext(c.id)}
                className={cn(
                  "rounded-xl border p-3 text-sm font-medium transition",
                  context === c.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-muted",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {context === "table" && (
            <div className="mt-4 space-y-2">
              <Label>{t("preview.selectTable")}</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("preview.selectTable")} />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((tbl) => (
                    <SelectItem key={tbl.id} value={tbl.id}>
                      {tbl.tableNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {context === "room" && (
            <div className="mt-4 space-y-2">
              <Label>{t("preview.selectRoom")}</Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("preview.selectRoom")} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((rm) => (
                    <SelectItem key={rm.id} value={rm.id}>
                      {rm.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Uses live menu, theme, language and branding from your restaurant record.
          </p>
        </Card>

        <Card className="overflow-hidden rounded-2xl shadow-card lg:col-span-2">
          <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            {restaurant.restaurantName} — {t(`preview.${context}`)}
          </div>
          {iframeSrc && ready ? (
            <iframe
              key={`${context}-${tableId}-${roomId}-${restaurant.updatedAt}`}
              title="Customer preview"
              src={iframeSrc}
              className="h-[720px] w-full border-0 bg-background"
            />
          ) : (
            <div className="flex h-[720px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
