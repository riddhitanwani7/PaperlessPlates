import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { getStaffApi, addStaffApi, updateStaffRoleApi, deactivateStaffApi, activateStaffApi, type StaffMember } from "@/lib/api/staff.api";
import { Loader2, Plus, UserCheck, UserX, MoreVertical, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { canCreateResource } from "@/lib/subscriptionPlans";

export const Route = createFileRoute("/app/staff")({
  component: () => <RoleGuard allow={["OWNER"]}><StaffPage /></RoleGuard>,
});

function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addStaffData, setAddStaffData] = useState({ name: "", email: "", role: "MANAGER" as const, password: "" });
  const [addingStaff, setAddingStaff] = useState(false);
  const { restaurant } = useRestaurant();
  const planId = restaurant?.selectedPlan;

  // Check if can add more staff
  const limitCheck = canCreateResource(planId, "staffMembers", staff.length);
  const canAddStaff = limitCheck.allowed;

  async function fetchStaff() {
    try {
      const token = auth.getToken();
      if (!token) return;
      const data = await getStaffApi(token);
      setStaff(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to load staff");
      setLoading(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setAddingStaff(true);
    try {
      const token = auth.getToken();
      if (!token) return;
      const result = await addStaffApi(token, addStaffData);
      toast.success(`Staff added. Temporary password: ${result.temporaryPassword}`);
      setAddDialogOpen(false);
      setAddStaffData({ name: "", email: "", role: "MANAGER", password: "" });
      fetchStaff();
    } catch (error) {
      console.error("Failed to add staff:", error);
      toast.error("Failed to add staff");
    } finally {
      setAddingStaff(false);
    }
  }

  async function handleUpdateRole(staffId: string, newRole: string) {
    try {
      const token = auth.getToken();
      if (!token) return;
      await updateStaffRoleApi(token, staffId, newRole);
      toast.success("Staff role updated");
      fetchStaff();
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    }
  }

  async function handleDeactivate(staffId: string) {
    try {
      const token = auth.getToken();
      if (!token) return;
      await deactivateStaffApi(token, staffId);
      toast.success("Staff deactivated");
      fetchStaff();
    } catch (error) {
      console.error("Failed to deactivate staff:", error);
      toast.error("Failed to deactivate staff");
    }
  }

  async function handleActivate(staffId: string) {
    try {
      const token = auth.getToken();
      if (!token) return;
      await activateStaffApi(token, staffId);
      toast.success("Staff activated");
      fetchStaff();
    } catch (error) {
      console.error("Failed to activate staff:", error);
      toast.error("Failed to activate staff");
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Staff Management"
          description="Manage your restaurant staff and their roles"
        />
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Staff Management"
        description="Manage your restaurant staff and their roles"
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canAddStaff}>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new staff account. A temporary password will be generated.
                </DialogDescription>
                {!canAddStaff && (
                  <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {limitCheck.message}
                    </div>
                  </div>
                )}
              </DialogHeader>
              <form onSubmit={handleAddStaff}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={addStaffData.name}
                      onChange={(e) => setAddStaffData({ ...addStaffData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={addStaffData.email}
                      onChange={(e) => setAddStaffData({ ...addStaffData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={addStaffData.role}
                      onValueChange={(value) => setAddStaffData({ ...addStaffData, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="KITCHEN">Kitchen</SelectItem>
                        <SelectItem value="WAITER">Waiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={addStaffData.password}
                      onChange={(e) => setAddStaffData({ ...addStaffData, password: e.target.value })}
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addingStaff}>
                    {addingStaff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Staff
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="rounded-2xl shadow-card">
        <div className="divide-y divide-border">
          {staff.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No staff members yet</div>
          ) : (
            staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-coral text-sm font-semibold text-primary-foreground">
                    {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
                    {member.status}
                  </Badge>
                  <Badge variant="outline">{member.role}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.status === "ACTIVE" ? (
                        <DropdownMenuItem onClick={() => handleDeactivate(member.id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleActivate(member.id)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "MANAGER")}>
                        Set as Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "KITCHEN")}>
                        Set as Kitchen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "WAITER")}>
                        Set as Waiter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}
