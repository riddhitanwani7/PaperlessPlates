import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, QrCode, Loader2, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { TableFormDialog } from "@/components/app/tables/TableFormDialog";
import {
  createTableApi,
  deleteTableApi,
  getRestaurantTablesApi,
  updateTableApi,
  type Table,
  type TableStatus,
} from "@/lib/api/table.api";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { canCreateResource } from "@/lib/subscriptionPlans";

export const Route = createFileRoute("/app/tables")({
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER", "WAITER"]}><TablesPage /></RoleGuard>
  ),
});

const STATUS_STYLES: Record<TableStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  OCCUPIED: "bg-amber-100 text-amber-700",
  RESERVED: "bg-blue-100 text-blue-700",
};

function TablesPage() {
  const { t } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { restaurant } = useRestaurant();
  const planId = restaurant?.selectedPlan;

  // Check if can add more tables
  const limitCheck = canCreateResource(planId, "tables", tables.length);
  const canAddTable = limitCheck.allowed;

  async function fetchTables() {
    try {
      const token = auth.getToken();
      const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
      if (!token || !restaurantId) {
        setLoading(false);
        return;
      }

      const { tables: tableData } = await getRestaurantTablesApi(token, restaurantId);
      setTables(tableData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error(t("tables.loadFailed"));
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTables();
  }, []);

  async function submit(data: { tableNumber: string; capacity: number; status: TableStatus }) {
    setSubmitting(true);
    try {
      const token = auth.getToken();
      const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
      if (!token || !restaurantId) {
        toast.error(t("tables.authRequired"));
        return;
      }

      if (editing) {
        // Update existing table
        const { table: updatedTable } = await updateTableApi(token, editing.id, data);
        setTables(tables.map((t) => (t.id === editing.id ? updatedTable : t)));
        toast.success(t("tables.updated"));
      } else {
        // Create new table
        const { table: newTable } = await createTableApi(token, {
          restaurantId,
          ...data,
        });
        setTables([...tables, newTable]);
        toast.success(t("tables.added"));
      }

      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Failed to save table:", error);
      toast.error(t("tables.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(tableId: string) {
    if (!confirm(t("tables.deleteConfirm"))) return;

    try {
      const token = auth.getToken();
      if (!token) {
        toast.error(t("tables.authRequired"));
        return;
      }

      await deleteTableApi(token, tableId);
      setTables(tables.filter((t) => t.id !== tableId));
      toast.success(t("tables.deleted"));
    } catch (error) {
      console.error("Failed to delete table:", error);
      toast.error(t("tables.deleteFailed"));
    }
  }

  const limitMessage = t("limits.resourceLimit", {
    plan: restaurant?.selectedPlan ?? "STARTER",
    limit: limitCheck.limit,
    resource: t("tables.resourceLabel"),
    upgrade: t("subscription.enterprise"),
  });

  return (
    <>
      <PageHeader
        title={t("tables.title")}
        description={t("tables.description")}
        actions={
          <Button className="bg-gradient-coral" disabled={!canAddTable} onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> {t("tables.addTable")}
          </Button>
        }
      />
      {!canAddTable && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {limitMessage}
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <Card key={table.id} className="rounded-2xl p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl">{table.tableNumber}</p>
                  <p className="text-xs text-muted-foreground"><Users className="mr-1 inline h-3 w-3" />{table.capacity} {t("tables.seats")}</p>
                </div>
                <Badge className={`border-0 ${STATUS_STYLES[table.status]}`}>{t(`status.${table.status.toLowerCase()}`)}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="h-3.5 w-3.5" />
                {table.qrAssigned ? t("tables.qrAssigned") : t("tables.noQr")}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(table); setOpen(true); }}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> {t("common.edit")}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(table.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <TableFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing ? { tableNumber: editing.tableNumber, capacity: editing.capacity, status: editing.status } : null}
        onSubmit={submit}
        submitting={submitting}
      />
    </>
  );
}
