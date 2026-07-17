import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AuthShell } from "@/components/app/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import { setAppLanguage } from "@/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — PaperlessPlates" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAppLanguage("en");
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await auth.login(email, password);
      console.log(`Login: User role is ${user.role}, navigating to ${roleHome(user.role)}`);
      // Only OWNER needs onboarding; staff go directly to their role's home
      if (user.role === "OWNER" && !user.isOnboarded) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: roleHome(user.role) });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.signInFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.welcomeBack")}
      subtitle={t("auth.signInSubtitle")}
      footer={
        <>
          {t("auth.newHere")} {" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {t("auth.createAccount")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("authActions.signingIn") : t("auth.signIn")}
        </Button>
      </form>
    </AuthShell>
  );
}
