import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PageHeader } from "@/components/app/AppLayout";
import { RoleGuard } from "@/components/app/RoleGuard";
import { notifyRestaurantUpdated, useRestaurant } from "@/components/app/RestaurantProvider";
import { useRestaurantTheme } from "@/components/app/ThemeProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Loader2, Sun, Moon, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  getMyRestaurantApi,
  updateProfileApi,
  updateSettingsApi,
  updateThemeApi,
  uploadLogoApi,
  uploadCoverApi,
  getPaymentSettingsApi,
  savePaymentSettingsApi,
  testPaymentSettingsConnectionApi,
  CUISINE_OPTIONS,
  DEFAULT_BUSINESS_HOURS,
  DAY_KEYS,
  DAY_LABELS,
  type Restaurant,
  type BusinessHours,
  type RestaurantTheme,
  type RestaurantSettings,
} from "@/lib/api/restaurant.api";
import { THEME_PRESETS } from "@/lib/restaurantTheme";
import { hasFeature } from "@/lib/subscriptionPlans";

const searchSchema = z.object({ tab: z.string().optional() });

const DEFAULT_SETTINGS: RestaurantSettings = {
  currency: "INR",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  language: "en",
  notifications: {
    email: true,
    sms: false,
    push: true,
    newOrders: true,
    kitchenAlerts: true,
    waiterAlerts: true,
    dailySummary: true,
    weeklyAnalytics: true,
    productUpdates: false,
  },
  qrPreferences: { autoGenerate: true, qrSize: "medium", showLogoOnQr: true },
  orderPreferences: {
    autoConfirm: false,
    preparationTime: 15,
    allowCustomerNotes: true,
    acceptTableOrders: true,
    acceptRoomOrders: true,
    acceptRestaurantOrders: true,
    acceptTakeawayOrders: true,
    requirePaymentBeforePreparation: false,
  },
  staffPreferences: { requireShiftCheckIn: false, allowWaiterOrderCancel: false },
  paymentConfig: {
    enabled: false,
    provider: null,
    testMode: true,
    acceptCash: true,
    acceptUpi: false,
  },
};

const DEFAULT_THEME: RestaurantTheme = {
  primaryColor: "#f97316",
  secondaryColor: "#1e293b",
  accentColor: "#fb923c",
  mode: "light",
  fontFamily: "Inter",
  borderRadius: "0.875rem",
};

export const Route = createFileRoute("/app/profile")({
  validateSearch: searchSchema,
  component: () => (
    <RoleGuard allow={["OWNER", "MANAGER"]}>
      <ProfileSettingsPage />
    </RoleGuard>
  ),
});

function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { tab } = Route.useSearch();
  const { setLanguage, refresh } = useRestaurant();
  const { refresh: refreshTheme } = useRestaurantTheme();
  const [activeTab, setActiveTab] = useState(tab ?? "info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [restaurantName, setRestaurantName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<RestaurantTheme>(DEFAULT_THEME);
  const hasMultipleThemes = hasFeature(restaurant?.selectedPlan, "multipleThemes");

  const [paymentProvider, setPaymentProvider] = useState<"razorpay" | null>("razorpay");
  const [paymentKeyId, setPaymentKeyId] = useState("");
  const [paymentKeySecret, setPaymentKeySecret] = useState("");
  const [paymentWebhookSecret, setPaymentWebhookSecret] = useState("");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [paymentIsConnected, setPaymentIsConnected] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function populate(data: Restaurant) {
    setRestaurant(data);
    setRestaurantName(data.restaurantName ?? "");
    setDescription(data.description ?? "");
    setAddress(data.address ?? "");
    setPhone(data.phone ?? "");
    setEmail(data.email ?? "");
    setCuisine(data.cuisine ?? "");
    setTaxNumber(data.taxNumber ?? "");
    setWebsite(data.socialMedia?.website ?? "");
    setBusinessHours(data.businessHours ?? DEFAULT_BUSINESS_HOURS);
    setSettings({
      ...DEFAULT_SETTINGS,
      ...data.settings,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...data.settings?.notifications },
      orderPreferences: { ...DEFAULT_SETTINGS.orderPreferences, ...data.settings?.orderPreferences },
    });
    if (data.theme) setTheme({ ...DEFAULT_THEME, ...data.theme });
  }

  useEffect(() => {
    async function load() {
      try {
        const token = auth.getToken();
        if (!token) return;
        const { restaurant: data } = await getMyRestaurantApi(token);
        if (data) populate(data);

        try {
          const paymentData = await getPaymentSettingsApi(token);
          setPaymentProvider(paymentData.provider);
          setPaymentKeyId(paymentData.keyId || "");
          setPaymentsEnabled(paymentData.paymentsEnabled);
          setPaymentIsConnected(paymentData.isConnected);
          setWebhookUrl(paymentData.webhookUrl || "");
        } catch (paymentErr) {
          console.error("Failed to load payment settings:", paymentErr);
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  async function handleImageUpload(file: File, type: "logo" | "cover") {
    try {
      const token = auth.getToken();
      if (!token) return;
      const { restaurant: updated } =
        type === "logo" ? await uploadLogoApi(token, file) : await uploadCoverApi(token, file);
      populate(updated);
      notifyRestaurantUpdated();
      toast.success(type === "logo" ? "Logo uploaded" : "Cover uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.error"));
    }
  }

  async function saveInfo() {
    setSaving(true);
    try {
      const token = auth.getToken();
      if (!token) return;
      const { restaurant: updated } = await updateProfileApi(token, {
        restaurantName,
        description,
        address,
        phone,
        email,
        cuisine: cuisine || undefined,
        taxNumber,
        socialMedia: { website },
      });
      populate(updated);
      notifyRestaurantUpdated();
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function saveHours() {
    setSaving(true);
    try {
      const token = auth.getToken();
      if (!token) return;
      const { restaurant: updated } = await updateProfileApi(token, { businessHours });
      populate(updated);
      notifyRestaurantUpdated();
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(partial: Parameters<typeof updateSettingsApi>[1]) {
    setSaving(true);
    try {
      const token = auth.getToken();
      if (!token) return;
      const { restaurant: updated } = await updateSettingsApi(token, partial);
      populate(updated);
      if (partial.language) setLanguage(partial.language);
      notifyRestaurantUpdated();
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function saveBranding() {
    setSaving(true);
    try {
      const token = auth.getToken();
      if (!token) return;
      const { restaurant: updated } = await updateThemeApi(token, theme);
      populate(updated);
      await refreshTheme();
      notifyRestaurantUpdated();
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTestingConnection(true);
    try {
      const token = auth.getToken();
      if (!token) return;

      const payload: any = {};
      if (paymentKeyId) payload.keyId = paymentKeyId;
      if (paymentKeySecret) payload.keySecret = paymentKeySecret;

      const response = await testPaymentSettingsConnectionApi(token, payload);
      toast.success(response.message || "Connected successfully!");
      setPaymentIsConnected(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid credentials");
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleSavePaymentSettings() {
    setSaving(true);
    try {
      const token = auth.getToken();
      if (!token) return;

      const payload: any = {
        provider: paymentProvider,
        keyId: paymentKeyId,
        paymentsEnabled,
      };

      if (paymentKeySecret) payload.keySecret = paymentKeySecret;
      if (paymentWebhookSecret) payload.webhookSecret = paymentWebhookSecret;

      const updatedSettings = await savePaymentSettingsApi(token, payload);
      setPaymentProvider(updatedSettings.provider);
      setPaymentKeyId(updatedSettings.keyId || "");
      setPaymentsEnabled(updatedSettings.paymentsEnabled);
      setPaymentIsConnected(updatedSettings.isConnected);
      setWebhookUrl(updatedSettings.webhookUrl || "");
      
      setPaymentKeySecret("");
      setPaymentWebhookSecret("");

      toast.success("Payment settings saved successfully");
      
      const { restaurant: data } = await getMyRestaurantApi(token);
      if (data) populate(data);
      notifyRestaurantUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  }

  function updateHours(day: keyof BusinessHours, field: keyof BusinessHours["monday"], value: string | boolean) {
    setBusinessHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="info">{t("profile.restaurantInfo")}</TabsTrigger>
          <TabsTrigger value="hours">{t("profile.businessHours")}</TabsTrigger>
          <TabsTrigger value="localization">{t("profile.localization")}</TabsTrigger>
          <TabsTrigger value="ordering">{t("profile.ordering")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("profile.notifications")}</TabsTrigger>
          <TabsTrigger value="branding">{t("profile.branding")}</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-5">
          <Card className="rounded-2xl p-5 shadow-card">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("profile.name")}</Label>
                <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("profile.descriptionLabel")}</Label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.cuisine")}</Label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger><SelectValue placeholder={t("profile.cuisine")} /></SelectTrigger>
                  <SelectContent>
                    {CUISINE_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.address")}</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.email")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.website")}</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.gst")}</Label>
                <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.logo")}</Label>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f, "logo"); }} />
                <button type="button" onClick={() => logoInputRef.current?.click()} className="grid h-24 w-full place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border">
                  {restaurant?.logoUrl ? <img src={restaurant.logoUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                </button>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.cover")}</Label>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f, "cover"); }} />
                <button type="button" onClick={() => coverInputRef.current?.click()} className="grid h-24 w-full place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border">
                  {restaurant?.coverImageUrl ? <img src={restaurant.coverImageUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <Button className="mt-5" disabled={saving} onClick={saveInfo}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("profile.save")}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="mt-5">
          <Card className="rounded-2xl p-5 shadow-card">
            <div className="divide-y divide-border">
              {DAY_KEYS.map((day) => (
                <div key={day} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-40 items-center gap-3">
                    <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                    <Switch checked={!businessHours[day].closed} onCheckedChange={(open) => updateHours(day, "closed", !open)} />
                  </div>
                  {!businessHours[day].closed ? (
                    <div className="flex flex-1 gap-2">
                      <Input type="time" value={businessHours[day].open} onChange={(e) => updateHours(day, "open", e.target.value)} className="max-w-[140px]" />
                      <span className="self-center text-muted-foreground">—</span>
                      <Input type="time" value={businessHours[day].close} onChange={(e) => updateHours(day, "close", e.target.value)} className="max-w-[140px]" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t("profile.closed")}</span>
                  )}
                </div>
              ))}
            </div>
            <Button className="mt-5" disabled={saving} onClick={saveHours}>{t("profile.save")}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="mt-5">
          <Card className="max-w-xl rounded-2xl p-5 shadow-card">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>{t("profile.language")}</Label>
                <Select value={settings.language} onValueChange={(v: "en" | "hi") => setSettings((s) => ({ ...s, language: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("profile.english")}</SelectItem>
                    <SelectItem value="hi">{t("profile.hindi")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.currency")}</Label>
                <Select value={settings.currency} onValueChange={(v) => setSettings((s) => ({ ...s, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="INR">INR (₹)</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.timezone")}</Label>
                <Select value={settings.timezone} onValueChange={(v) => setSettings((s) => ({ ...s, timezone: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.dateFormat")}</Label>
                <Select value={settings.dateFormat} onValueChange={(v: RestaurantSettings["dateFormat"]) => setSettings((s) => ({ ...s, dateFormat: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-5" disabled={saving} onClick={() => saveSettings({ language: settings.language, currency: settings.currency, timezone: settings.timezone, dateFormat: settings.dateFormat })}>{t("profile.save")}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="ordering" className="mt-5">
          <Card className="max-w-xl rounded-2xl p-5 shadow-card">
            <ul className="divide-y divide-border">
              {([
                ["acceptTableOrders", t("profile.acceptTable")],
                ["acceptRoomOrders", t("profile.acceptRoom")],
                ["acceptRestaurantOrders", t("profile.acceptRestaurant")],
                ["acceptTakeawayOrders", t("profile.acceptTakeaway")],
                ["autoConfirm", t("profile.autoAccept")],
                ["requirePaymentBeforePreparation", t("profile.requirePayment")],
              ] as const).map(([key, label]) => (
                <li key={key} className="flex items-center justify-between py-3">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={settings.orderPreferences[key]}
                    onCheckedChange={(checked) =>
                      setSettings((s) => ({
                        ...s,
                        orderPreferences: { ...s.orderPreferences, [key]: checked },
                      }))
                    }
                  />
                </li>
              ))}
            </ul>
            <Button className="mt-5" disabled={saving} onClick={() => saveSettings({ orderPreferences: settings.orderPreferences })}>{t("profile.save")}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <Card className="max-w-xl rounded-2xl p-5 shadow-card">
            <ul className="divide-y divide-border">
              {([
                ["newOrders", t("profile.newOrders")],
                ["kitchenAlerts", t("profile.kitchenAlerts")],
                ["waiterAlerts", t("profile.waiterAlerts")],
                ["email", t("profile.emailNotifications")],
              ] as const).map(([key, label]) => (
                <li key={key} className="flex items-center justify-between py-3">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={settings.notifications[key]}
                    onCheckedChange={(checked) =>
                      setSettings((s) => ({
                        ...s,
                        notifications: { ...s.notifications, [key]: checked },
                      }))
                    }
                  />
                </li>
              ))}
            </ul>
            <Button className="mt-5" disabled={saving} onClick={() => saveSettings({ notifications: settings.notifications })}>{t("profile.save")}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-5">
          {!hasMultipleThemes && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Your Basic plan includes a single default theme. Upgrade to Premium to unlock multiple themes and full customization.
              </div>
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="rounded-2xl p-5 shadow-card lg:col-span-2">
              <fieldset disabled={!hasMultipleThemes} className={cn(!hasMultipleThemes && "opacity-50 pointer-events-none")}>
              <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button key={preset.name} type="button" onClick={() => setTheme((t) => ({ ...t, primaryColor: preset.primaryColor, secondaryColor: preset.secondaryColor, accentColor: preset.accentColor }))} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm", theme.primaryColor === preset.primaryColor && "border-foreground")}>
                    <span className="h-4 w-4 rounded-full" style={{ background: preset.primaryColor }} />
                    {preset.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label>{t(`profile.${key === "primaryColor" ? "primaryColor" : key === "secondaryColor" ? "secondaryColor" : "accentColor"}`)}</Label>
                    <input type="color" value={theme[key]} onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))} className="h-10 w-full cursor-pointer rounded border" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setTheme((t) => ({ ...t, mode: "light" }))} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border p-3", theme.mode === "light" && "border-primary bg-primary-soft")}><Sun className="h-4 w-4" />{t("profile.lightMode")}</button>
                <button type="button" onClick={() => setTheme((t) => ({ ...t, mode: "dark" }))} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border p-3", theme.mode === "dark" && "border-primary bg-primary-soft")}><Moon className="h-4 w-4" />{t("profile.darkMode")}</button>
              </div>
              <div className="mt-4 space-y-2">
                <Label>{t("profile.borderRadius")}</Label>
                <Select value={theme.borderRadius ?? "0.875rem"} onValueChange={(v) => setTheme((t) => ({ ...t, borderRadius: v }))}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5rem">Small</SelectItem>
                    <SelectItem value="0.875rem">Medium</SelectItem>
                    <SelectItem value="1rem">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </fieldset>
              <Button className="mt-5" disabled={saving || !hasMultipleThemes} onClick={saveBranding}>{t("profile.save")}</Button>
            </Card>
            <Card className="rounded-2xl p-5 shadow-card">
              <div className="overflow-hidden rounded-xl border">
                <div className="h-16" style={{ background: theme.primaryColor }} />
                <div className="p-4">
                  <p className="font-display text-lg" style={{ fontFamily: theme.fontFamily }}>{restaurantName}</p>
                  <button type="button" className="mt-3 w-full rounded-lg py-2 text-sm text-white" style={{ background: theme.primaryColor }}>{t("customer.addToCart")}</button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-5">
          <Card className="max-w-xl rounded-2xl p-5 shadow-card space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payments Settings</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  {paymentIsConnected ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure your Razorpay merchant account credentials to receive online payments from customers directly.
              </p>
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Provider</Label>
                <Select
                  value={paymentProvider || "razorpay"}
                  onValueChange={(v) => setPaymentProvider(v as "razorpay" | null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Key ID</Label>
                <Input
                  value={paymentKeyId}
                  onChange={(e) => setPaymentKeyId(e.target.value)}
                  placeholder="rzp_test_..."
                />
              </div>

              <div className="space-y-1">
                <Label>Key Secret</Label>
                <Input
                  type="password"
                  value={paymentKeySecret}
                  onChange={(e) => setPaymentKeySecret(e.target.value)}
                  placeholder={paymentIsConnected ? "••••••••••••••••" : "Enter Key Secret"}
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
                <h4 className="font-semibold text-foreground">Webhook Setup Instructions:</h4>
                <p className="text-muted-foreground leading-relaxed">
                  1. Log in to your Razorpay Dashboard and navigate to Settings &gt; Webhooks.<br />
                  2. Create a webhook with the following URL:<br />
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold text-foreground select-all break-all">
                    {webhookUrl || "Loading Webhook URL..."}
                  </code><br />
                  3. Select the following Active Events:<br />
                  <span className="font-medium text-foreground">✔ payment.captured</span> and <span className="font-medium text-foreground">✔ payment.failed</span><br />
                  4. Paste the Webhook Secret you entered/configured on Razorpay below.
                </p>
              </div>

              <div className="space-y-1">
                <Label>Webhook Secret</Label>
                <Input
                  type="password"
                  value={paymentWebhookSecret}
                  onChange={(e) => setPaymentWebhookSecret(e.target.value)}
                  placeholder={paymentIsConnected ? "••••••••••••••••" : "Enter Webhook Secret"}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="payments-enabled-toggle" className="cursor-pointer font-medium">Payments Enabled</Label>
                  <p className="text-xs text-muted-foreground">Accept online payments from customers on your menu.</p>
                </div>
                <Switch
                  id="payments-enabled-toggle"
                  checked={paymentsEnabled}
                  onCheckedChange={setPaymentsEnabled}
                  disabled={!paymentIsConnected}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testingConnection || !paymentKeyId}
                className="flex-1"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button
                onClick={handleSavePaymentSettings}
                disabled={saving || !paymentKeyId}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
