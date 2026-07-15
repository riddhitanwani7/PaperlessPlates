import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, QrCode, BedDouble, Loader2, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { RoomFormDialog } from "@/components/app/rooms/RoomFormDialog";
import {
  createRoomApi,
  deleteRoomApi,
  getRestaurantRoomsApi,
  updateRoomApi,
  type Room,
  type RoomStatus,
} from "@/lib/api/room.api";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { canCreateResource } from "@/lib/subscriptionPlans";

export const Route = createFileRoute("/app/rooms")({
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER", "WAITER"]}><RoomsPage /></RoleGuard>
  ),
});

const STATUS_STYLES: Record<RoomStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  OCCUPIED: "bg-amber-100 text-amber-700",
  MAINTENANCE: "bg-red-100 text-red-700",
};

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { restaurant } = useRestaurant();
  const planId = restaurant?.selectedPlan;

  // Check if can add more rooms
  const limitCheck = canCreateResource(planId, "rooms", rooms.length);
  const canAddRoom = limitCheck.allowed;

  async function fetchRooms() {
    try {
      const token = auth.getToken();
      const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
      if (!token || !restaurantId) {
        setLoading(false);
        return;
      }

      const { rooms: roomData } = await getRestaurantRoomsApi(token, restaurantId);
      setRooms(roomData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to load rooms");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  async function submit(data: { roomNumber: string; floor: number; status: RoomStatus }) {
    setSubmitting(true);
    try {
      const token = auth.getToken();
      const restaurantId = localStorage.getItem("pp_owner_restaurant_id");
      if (!token || !restaurantId) {
        toast.error("Authentication required");
        return;
      }

      if (editing) {
        // Update existing room
        const { room: updatedRoom } = await updateRoomApi(token, editing.id, data);
        setRooms(rooms.map((r) => (r.id === editing.id ? updatedRoom : r)));
        toast.success("Room updated successfully");
      } else {
        // Create new room
        const { room: newRoom } = await createRoomApi(token, {
          restaurantId,
          ...data,
        });
        setRooms([...rooms, newRoom]);
        toast.success("Room added successfully");
      }

      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Failed to save room:", error);
      toast.error("Failed to save room");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(roomId: string) {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const token = auth.getToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await deleteRoomApi(token, roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
      toast.success("Room deleted successfully");
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    }
  }

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Hotel room ordering. Manage rooms, occupancy and assigned QR codes."
        actions={
          <Button className="bg-gradient-coral" disabled={!canAddRoom} onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add room
          </Button>
        }
      />
      {!canAddRoom && (
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
          {rooms.map((r) => (
            <Card key={r.id} className="rounded-2xl p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl">Room {r.roomNumber}</p>
                  <p className="text-xs text-muted-foreground"><BedDouble className="mr-1 inline h-3 w-3" />Floor {r.floor}</p>
                </div>
                <Badge className={`border-0 ${STATUS_STYLES[r.status]}`}>{r.status}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="h-3.5 w-3.5" />
                {r.qrAssigned ? "QR assigned" : "No QR"}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(r); setOpen(true); }}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <RoomFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing ? { roomNumber: editing.roomNumber, floor: editing.floor, status: editing.status } : null}
        onSubmit={submit}
        submitting={submitting}
      />
    </>
  );
}
