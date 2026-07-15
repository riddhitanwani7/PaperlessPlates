import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, QrCode, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import {
  completeOnboardingApi,
  getMyRestaurantApi,
  saveOnboardingApi,
} from "@/lib/api/restaurant.api";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — PaperlessPlates" }] }),
  component: Onboarding,
});

const steps = ["Restaurant Info", "QR Setup", "Activate"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({
    name: "Bistro Lumière",
    address: "",
    phone: "",
    type: "restaurant",
  });
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!auth.isAuthed()) {
        navigate({ to: "/login" });
        return;
      }

      try {
        const user = await auth.refreshSession();
        if (cancelled) return;

        // Only OWNER should access onboarding
        if (user.role !== "OWNER") {
          navigate({ to: roleHome(user.role) });
          return;
        }

        if (user.isOnboarded) {
          navigate({ to: "/app" });
          return;
        }

        const token = auth.getToken();
        if (!token) {
          navigate({ to: "/login" });
          return;
        }

        const { restaurant } = await getMyRestaurantApi(token);
        if (cancelled) return;

        if (restaurant) {
          if (restaurant.id) {
            localStorage.setItem("pp_owner_restaurant_id", restaurant.id);
          }
          if (restaurant.restaurantName) {
            setInfo((prev) => ({
              ...prev,
              name: restaurant.restaurantName ?? prev.name,
              address: restaurant.address ?? prev.address,
              phone: restaurant.phone ?? prev.phone,
              type: restaurant.businessType ?? prev.type,
            }));
          }
          if (restaurant.slug) {
            setSlug(restaurant.slug);
          }

          if (restaurant.qrEnabled) {
            setStep(2);
          } else if (restaurant.restaurantName) {
            setStep(1);
          }
        }
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof ApiError ? err.message : "Could not load onboarding");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const next = async () => {
    const token = auth.getToken();
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    setSaving(true);
    try {
      if (step === 0) {
        const { restaurant } = await saveOnboardingApi(token, {
          restaurantName: info.name,
          address: info.address,
          phone: info.phone,
          businessType: info.type as "restaurant" | "cafe" | "hotel" | "bar" | "cloud",
        });
        if (restaurant.slug) {
          setSlug(restaurant.slug);
        }
        if (restaurant.id) {
          localStorage.setItem("pp_owner_restaurant_id", restaurant.id);
        }
      } else if (step === 1) {
        const { restaurant } = await saveOnboardingApi(token, { qrEnabled: true });
        if (restaurant.slug) {
          setSlug(restaurant.slug);
        }
        if (restaurant.id) {
          localStorage.setItem("pp_owner_restaurant_id", restaurant.id);
        }
      }

      setStep((s) => Math.min(s + 1, steps.length - 1));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save onboarding step");
    } finally {
      setSaving(false);
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    const token = auth.getToken();
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    setSaving(true);
    try {
      const { user } = await completeOnboardingApi(token);
      auth.updateUser(user);
      await auth.refreshSession();
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not complete onboarding");
    } finally {
      setSaving(false);
    }
  };

  const displaySlug =
    slug || info.name.toLowerCase().replace(/\s+/g, "-");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-14">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-coral text-primary-foreground font-bold">
            P
          </div>
          <span className="font-display text-lg">PaperlessPlates</span>
        </Link>

        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  i <= step
                    ? "bg-gradient-coral text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div
                className={cn(
                  "hidden flex-1 text-xs sm:block",
                  i <= step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1", i < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl">Tell us about your restaurant</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This information appears on your QR menu and receipts.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rn">Restaurant name</Label>
                  <Input
                    id="rn"
                    value={info.name}
                    onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ad">Address</Label>
                  <Input
                    id="ad"
                    value={info.address}
                    onChange={(e) => setInfo({ ...info, address: e.target.value })}
                    placeholder="123 Main Street, City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph">Contact number</Label>
                  <Input
                    id="ph"
                    value={info.phone}
                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                    placeholder="+1 555 0100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <Select value={info.type} onValueChange={(v) => setInfo({ ...info, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="cafe">Café</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="bar">Bar / Lounge</SelectItem>
                      <SelectItem value="cloud">Cloud Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-primary-soft">
                <QrCode className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl">Your QR menu is ready</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We generated a unique QR code for {info.name}. You can print, share or
                  customize it from your dashboard.
                </p>
              </div>
              <div className="mx-auto grid max-w-xs gap-3 rounded-2xl border border-border bg-surface p-6">
                <div className="mx-auto grid h-40 w-40 place-items-center rounded-xl bg-foreground text-background">
                  <QrCode className="h-32 w-32" />
                </div>
                <p className="text-xs text-muted-foreground">
                  paperlessplates.app/{displaySlug}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-coral text-primary-foreground">
                <Sparkles className="h-10 w-10" />
              </div>
              <div>
                <h2 className="font-display text-2xl">You're all set, {info.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your restaurant is now active with the STARTER plan.
                </p>
              </div>
              <Button size="lg" onClick={finish} className="mx-auto" disabled={saving}>
                Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {step < 2 && (
            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={step === 0 || saving}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button onClick={next} disabled={saving}>
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
