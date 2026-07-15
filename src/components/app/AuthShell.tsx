import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-gradient-coral p-12 text-primary-foreground lg:flex">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 font-bold backdrop-blur">
              P
            </div>
            <span className="font-display text-xl">PaperlessPlates</span>
          </Link>
          <div className="space-y-6">
            <h2 className="font-display text-4xl leading-tight">
              The operating system for modern restaurants & hotels.
            </h2>
            <p className="text-white/80">
              QR ordering, kitchen displays, room service and analytics — one
              elegant dashboard.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4 text-sm">
              {[
                ["12k+", "Restaurants"],
                ["2.4M", "Orders/mo"],
                ["99.99%", "Uptime"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-3 backdrop-blur">
                  <div className="font-display text-2xl">{v}</div>
                  <div className="text-white/70 text-xs">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">© 2026 PaperlessPlates Inc.</p>
        </aside>
        <main className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-coral text-primary-foreground font-bold">
                P
              </div>
              <span className="font-display text-lg">PaperlessPlates</span>
            </Link>
            <h1 className="font-display text-3xl tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
