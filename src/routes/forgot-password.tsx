import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/app/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/i18n";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — PaperlessPlates" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAppLanguage("en");
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("authActions.couldNotSendResetLink"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("authActions.resetYourPassword")}
      subtitle={t("authActions.resetSubtitle")}
      footer={
        <>
          {t("authActions.rememberedIt")} {" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("authActions.backToSignIn")}
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-medium">{t("authActions.checkInbox")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("authActions.emailSentPrefix")} {" "}
            <span className="text-foreground">{email}</span>, we sent a reset link.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("authActions.sendingResetLink") : t("authActions.sendResetLink")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
