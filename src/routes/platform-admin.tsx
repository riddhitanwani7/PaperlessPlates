import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { apiRequestAuth } from "@/lib/api/client";
import { PLANS } from "@/lib/subscriptionPlans";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/platform-admin")({
  component: AdminPage,
});

interface Restaurant {
  id: string;
  restaurantName: string;
  email: string;
  phone: string;
  selectedPlan: string;
  onboardingCompleted: boolean;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
}

function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Auth check - redirect if not SUPER_ADMIN
  useEffect(() => {
    const user = auth.getUser();
    console.log("AdminPage auth check:", user?.role);
    if (!user || user.role !== "SUPER_ADMIN") {
      console.log("AdminPage: Not SUPER_ADMIN, redirecting to login");
      navigate({ to: "/login" });
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    auth.logout();
    navigate({ to: "/login" });
  };

  async function loadRestaurants() {
    try {
      const token = auth.getToken();
      if (!token) return;
      
      const url = search ? `/admin/restaurants?search=${encodeURIComponent(search)}` : "/admin/restaurants";
      // apiRequestAuth already unwraps the API envelope's `data` property.
      const response = await apiRequestAuth<Restaurant[]>(url, token);
      setRestaurants(response);
    } catch (err) {
      console.error("Failed to load restaurants:", err);
      toast.error(err instanceof ApiError ? err.message : t("admin.loadFailed"));
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authChecked) {
      loadRestaurants();
    }
  }, [authChecked]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search !== undefined) {
        loadRestaurants();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  async function handlePlanChange(restaurantId: string, newPlan: string) {
    setUpdating(restaurantId);
    try {
      const token = auth.getToken();
      if (!token) return;
      
      await apiRequestAuth(`/admin/restaurants/${restaurantId}/plan`, token, {
        method: "PATCH",
        body: JSON.stringify({ selectedPlan: newPlan }),
      });
      
      toast.success(t("admin.planUpdated", { plan: newPlan }));
      await loadRestaurants();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("admin.updateFailed"));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-coral text-primary-foreground font-bold">P</div>
          <span className="font-display text-lg">PaperlessPlates Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("admin.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("admin.description")}</p>
          </div>
        </div>

        {!authChecked || loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="rounded-2xl p-6 shadow-card">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("admin.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium">{t("admin.restaurant")}</th>
                  <th className="pb-3 font-medium">{t("admin.owner")}</th>
                  <th className="pb-3 font-medium">{t("admin.currentPlan")}</th>
                  <th className="pb-3 font-medium">{t("admin.status")}</th>
                  <th className="pb-3 font-medium">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      {t("admin.empty")}
                    </td>
                  </tr>
                ) : (
                  restaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="border-b border-border">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{restaurant.restaurantName}</p>
                          <p className="text-xs text-muted-foreground">{restaurant.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{restaurant.ownerName}</p>
                          <p className="text-xs text-muted-foreground">{restaurant.ownerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          className={cn(
                            restaurant.selectedPlan === "ENTERPRISE"
                              ? "bg-gradient-coral text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {restaurant.selectedPlan}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={restaurant.onboardingCompleted ? "default" : "secondary"}
                          className={cn(
                            restaurant.onboardingCompleted
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {restaurant.onboardingCompleted ? t("admin.active") : t("admin.onboarding")}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={restaurant.selectedPlan}
                            onValueChange={(value) => handlePlanChange(restaurant.id, value)}
                            disabled={updating === restaurant.id}
                          >
                            <SelectTrigger className="w-32">
                              {updating === restaurant.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {PLANS.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {updating === restaurant.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
        )}
      </main>
    </div>
  );
}
