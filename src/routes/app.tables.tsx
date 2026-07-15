import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
      toast.error("Failed to load tables");
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
        toast.error("Authentication required");
        return;
      }

      if (editing) {
        // Update existing table
        const { table: updatedTable } = await updateTableApi(token, editing.id, data);
        setTables(tables.map((t) => (t.id === editing.id ? updatedTable : t)));
        toast.success("Table updated successfully");
      } else {
        // Create new table
        const { table: newTable } = await createTableApi(token, {
          restaurantId,
          ...data,
        });
        setTables([...tables, newTable]);
        toast.success("Table added successfully");
      }

      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Failed to save table:", error);
      toast.error("Failed to save table");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(tableId: string) {
    if (!confirm("Are you sure you want to delete this table?")) return;

    try {
      const token = auth.getToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await deleteTableApi(token, tableId);
      setTables(tables.filter((t) => t.id !== tableId));
      toast.success("Table deleted successfully");
    } catch (error) {
      console.error("Failed to delete table:", error);
      toast.error("Failed to delete table");
    }
  }

  return (
    <>
      <PageHeader
        title="Tables"
        description="Manage every table, its capacity and the QR code assigned to it."
        actions={
          <Button className="bg-gradient-coral" disabled={!canAddTable} onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add table
          </Button>
        }
      />
      {!canAddTable && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {limitCheck.message}
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((t) => (
            <Card key={t.id} className="rounded-2xl p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl">{t.tableNumber}</p>
                  <p className="text-xs text-muted-foreground"><Users className="mr-1 inline h-3 w-3" />{t.capacity} seats</p>
                </div>
                <Badge className={`border-0 ${STATUS_STYLES[t.status]}`}>{t.status}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="h-3.5 w-3.5" />
                {t.qrAssigned ? "QR assigned" : "No QR"}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(t); setOpen(true); }}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}>
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
