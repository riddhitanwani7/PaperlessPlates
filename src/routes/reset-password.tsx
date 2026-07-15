import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/app/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/roles";

const resetSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: resetSearchSchema,
  head: () => ({ meta: [{ title: "Set new password — PaperlessPlates" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset link is invalid or missing.");
      return;
    }
    if (p1 !== p2) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const user = await auth.resetPassword(token, p1);
      toast.success("Password updated. You are now signed in.");
      // Only OWNER needs onboarding; staff go directly to their role's home
      if (user.role === "OWNER" && !user.isOnboarded) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: roleHome(user.role) });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This password reset link is missing or has expired."
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Request a new link
          </Link>
        }
      >
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          Open the link from your email, or request a new one.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="p1">New password</Label>
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
          <Label htmlFor="p2">Confirm password</Label>
          <Input
            id="p2"
            type="password"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimum 8 characters with one number.
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !p1 || p1 !== p2}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
