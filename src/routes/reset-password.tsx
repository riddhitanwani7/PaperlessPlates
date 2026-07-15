import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/app/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/i18n";

const resetSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: resetSearchSchema,
  head: () => ({ meta: [{ title: "Set new password — PaperlessPlates" }] }),
  component: ResetPage,
});

function ResetPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAppLanguage("en");
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("authActions.resetLinkMissing"));
      return;
    }
    if (p1 !== p2) {
      toast.error(t("authActions.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const user = await auth.resetPassword(token, p1);
      toast.success(t("authActions.passwordUpdated"));
      // Only OWNER needs onboarding; staff go directly to their role's home
      if (user.role === "OWNER" && !user.isOnboarded) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: roleHome(user.role) });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("authActions.couldNotResetPassword"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title={t("authActions.invalidResetLink")}
        subtitle={t("authActions.resetLinkExpired")}
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            {t("authActions.requestNewLink")}
          </Link>
        }
      >
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          {t("authActions.openTheLink")}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("authActions.setNewPassword")}
      subtitle={t("authActions.chooseStrongPassword")}
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          {t("authActions.backToSignIn")}
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="p1">{t("authActions.newPassword")}</Label>
          <Input
            id="p1"
            type="password"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p2">{t("authActions.confirmPassword")}</Label>
          <Input
            id="p2"
            type="password"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">
            {t("auth.minimumPassword")}
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !p1 || p1 !== p2}
        >
          {loading ? t("authActions.updatingPassword") : t("authActions.updatePassword")}
        </Button>
      </form>
    </AuthShell>
  );
}
