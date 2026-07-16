import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Button } from "@/components/ui/button";
import { QRCard } from "@/components/app/qr/QRCard";
import { GenerateQRDialog } from "@/components/app/qr/GenerateQRDialog";
import { ApiError } from "@/lib/api/client";
import { generateQRApi, getMyQRApi, updateQRApi } from "@/lib/api/qr.api";
import { auth } from "@/lib/auth";
import type { QREntity } from "@/lib/types/qr";
import { Loader2, Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { canCreateResource } from "@/lib/subscriptionPlans";

export const Route = createFileRoute("/app/qr-management")({
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER"]}>
      <QRPage />
    </RoleGuard>
  ),
});

const TYPES = ["All", "Restaurant", "Table", "Room", "Takeaway"] as const;

function QRPage() {
  const { t } = useTranslation();
  const [qrs, setQrs] = useState<QREntity[]>([]);
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("All");
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { restaurant } = useRestaurant();
  const planId = restaurant?.selectedPlan;

  // Check if can add more QR codes
  const limitCheck = canCreateResource(planId, "qrCodes", qrs.length);
  const canAddQR = limitCheck.allowed;

  async function loadQR() {
    const token = auth.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const { qrs: qrList } = await getMyQRApi(token);
      setQrs(qrList || []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("qr.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQR();
  }, []);

  const filtered = qrs.filter((q) => filter === "All" || q.type === filter);

  async function handleGenerate(data: {
    type: "Table" | "Room" | "Restaurant" | "Takeaway";
    label: string;
    bulkFrom?: number;
    bulkTo?: number;
  }) {
    const token = auth.getToken();
    if (!token) return;

    setGenerating(true);
    try {
      if (data.bulkFrom && data.bulkTo) {
        // Bulk generation
        const promises = [];
        for (let i = data.bulkFrom; i <= data.bulkTo; i++) {
          const id = data.type === "Table" ? `T${i}` : `R${i}`;
          promises.push(
            generateQRApi(token, {
              type: data.type,
              tableId: data.type === "Table" ? id : undefined,
              roomId: data.type === "Room" ? id : undefined,
            }),
          );
        }
        const results = await Promise.all(promises);
        setQrs([...qrs, ...results.map((r) => r.qr)]);
        toast.success(t("qr.generatedBulk", { count: data.bulkTo - data.bulkFrom + 1 }));
      } else {
        // Single generation
        const { qr } = await generateQRApi(token, {
          type: data.type,
          tableId: data.type === "Table" ? data.label : undefined,
          roomId: data.type === "Room" ? data.label : undefined,
        });
        setQrs([...qrs, qr]);
        toast.success(t("qr.generatedSingle"));
      }
      setDialog(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("qr.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }

  async function toggle(id: string) {
    const token = auth.getToken();
    if (!token) return;

    const current = qrs.find((q) => q.id === id);
    if (!current) return;

    try {
      const { qr } = await updateQRApi(token, id, !current.active);
      setQrs([qr]);
      toast.success(qr.active ? t("qr.activated") : t("qr.deactivated"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("qr.updateFailed"));
    }
  }

  const limitMessage = t("limits.resourceLimit", {
    plan: restaurant?.selectedPlan ?? "STARTER",
    limit: limitCheck.limit,
    resource: t("qr.resourceLabel"),
    upgrade: t("subscription.enterprise"),
  });

  return (
    <>
      <PageHeader
        title={t("qr.title")}
        description={t("qr.description")}
        actions={
          <Button
            className="bg-gradient-coral"
            onClick={() => setDialog(true)}
            disabled={generating || !canAddQR}
          >
            {generating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            {t("qr.generate")}
          </Button>
        }
      />
      {!canAddQR && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {limitMessage}
          </div>
        </div>
      )}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TYPES.map((typeOption) => (
          <button
            key={typeOption}
            onClick={() => setFilter(typeOption)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === typeOption
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {typeOption === "All"
              ? t("qr.all")
              : typeOption === "Restaurant"
                ? t("orderType.RESTAURANT")
                : typeOption === "Table"
                  ? t("orderType.TABLE")
                  : typeOption === "Room"
                    ? t("orderType.ROOM")
                    : t("orderType.TAKEAWAY")}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          {t("qr.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
          {t("qr.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((qr) => (
            <QRCard
              key={qr.id}
              qr={qr}
              restaurantName={restaurant?.restaurantName ?? qr.label}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
      <GenerateQRDialog open={dialog} onOpenChange={setDialog} onGenerate={handleGenerate} />
    </>
  );
}
