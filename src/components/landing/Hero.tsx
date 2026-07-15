import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ChefHat, TrendingUp, Clock, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.96_0.05_25)_0%,transparent_100%)]" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-16 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
            Trusted by modern restaurants & hotels
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Go Paperless. <br />
            Serve Faster. <span className="text-primary">Earn More.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            QR-based digital menus, real-time order management, kitchen displays, analytics,
            and room service ordering — all in one platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-gradient-coral shadow-elevated hover:opacity-95">
              <Link to="/register">
                Create Free Account <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border bg-card">
              <Link to="/login">Admin Login</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              { icon: Clock, label: "5 Min Setup" },
              { icon: ShieldCheck, label: "No Hardware" },
              { icon: InfinityIcon, label: "Unlimited Orders" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-2">
                <s.icon className="h-5 w-5 text-primary" />
                <dt className="text-sm font-semibold text-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-coral opacity-20 blur-3xl" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-elevated">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Live Dashboard</p>
            <p className="text-sm font-semibold">Bella Vita · Downtown</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" /> Live
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Today's Revenue
            </div>
            <p className="mt-2 font-display text-3xl">₹4,128</p>
            <p className="mt-1 text-xs text-primary">↑ 18% vs yesterday</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> Orders Today
            </div>
            <p className="mt-2 font-display text-3xl">147</p>
            <p className="mt-1 text-xs text-muted-foreground">23 active now</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Kitchen Status</p>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              { table: "Table 12", item: "Truffle Risotto ×2", time: "2m", status: "preparing" },
              { table: "Room 304", item: "Club Sandwich", time: "5m", status: "ready" },
              { table: "Table 07", item: "Margherita Pizza", time: "8m", status: "preparing" },
            ].map((o) => (
              <div key={o.table} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{o.table}</p>
                  <p className="text-xs text-muted-foreground">{o.item}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{o.time}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      o.status === "ready"
                        ? "bg-primary-soft text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
