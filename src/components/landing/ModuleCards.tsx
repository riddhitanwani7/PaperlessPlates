import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  QrCode, Clock3, ChefHat, BarChart3, CreditCard, BedDouble,
  Check, Sparkles, Smartphone, Instagram, Linkedin, MessageCircle,
  Mail, ArrowRight, LogIn, UserCog, MailCheck, KeyRound, LayoutDashboard,
  Package, PlayCircle, Calendar, Users, Building2,
} from "lucide-react";

/* ============================================================
   Shared SaaS module card wrapper
   ============================================================ */
type ModuleCardProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  letter: string;
  children: React.ReactNode;
  tone?: "default" | "raised";
};

function ModuleCard({
  id, eyebrow, title, description, icon: Icon, letter, children, tone = "default",
}: ModuleCardProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <article
        className={`relative overflow-hidden rounded-[28px] border border-border bg-card ${
          tone === "raised" ? "shadow-elevated" : "shadow-card"
        } transition-shadow hover:shadow-elevated`}
      >
        {/* Card header strip */}
        <header className="flex flex-col gap-5 border-b border-border bg-surface/60 px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-coral text-primary-foreground shadow-soft">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <span className="rounded-md bg-primary-soft px-1.5 py-0.5 font-mono text-[10px]">{letter}</span>
                {eyebrow}
              </div>
              <h2 className="mt-1.5 font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 self-start rounded-full border border-border bg-card px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" /> Module
          </span>
        </header>

        {/* Card body */}
        <div className="px-7 py-8 sm:px-10 sm:py-10">{children}</div>
      </article>
    </section>
  );
}

/* ============================================================
   A. Restaurant Portal Card
   ============================================================ */
export function RestaurantPortalModule() {
  const portals: { icon: typeof LogIn; title: string; desc: string; cta: string; to: string }[] = [
    { icon: LogIn, title: "Admin Login", desc: "Owner-level access to settings, billing, and locations.", cta: "Open Admin", to: "/login" },
    { icon: UserCog, title: "Manager Login", desc: "Daily operations, staff, and live order oversight.", cta: "Open Manager", to: "/login" },
    { icon: MailCheck, title: "Email Verification", desc: "Secure onboarding with one-tap email verify.", cta: "Verify Email", to: "/register" },
    { icon: KeyRound, title: "Password Recovery", desc: "Self-serve reset with magic links in seconds.", cta: "Reset Password", to: "/forgot-password" },
    { icon: LayoutDashboard, title: "Dashboard Access", desc: "Unified KPIs, orders, and analytics in one place.", cta: "Go to Dashboard", to: "/login" },
  ];
  return (
    <ModuleCard
      id="portal"
      letter="A"
      eyebrow="Access Module"
      title="Restaurant Portal"
      description="One secure entry point for every role in your restaurant or hotel."
      icon={Sparkles}
      tone="raised"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portals.map((p) => (
          <div
            key={p.title}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-gradient-coral group-hover:text-primary-foreground">
              <p.icon className="h-4.5 w-4.5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">{p.title}</h3>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
            <Link to={p.to} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              {p.cta} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </ModuleCard>
  );
}

/* ============================================================
   B. Subscription Card
   ============================================================ */
const PLANS = [
  {
    name: "Basic", price: "₹999", desc: "For small cafés getting started.",
    features: ["Digital Menu", "QR Ordering", "Table Ordering", "Single Theme", "Hindi & English", "Online Payments", "Basic Analytics"],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Premium", price: "₹2,499", desc: "Most popular for growing restaurants.",
    features: ["Everything in Basic", "Kitchen Display", "Multiple Themes", "Advanced Analytics"],
    cta: "Start Free Trial", highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", desc: "For hotels and multi-location groups.",
    features: ["Everything in Premium", "Dedicated Support", "Custom Pricing"],
    cta: "Contact Sales", highlight: false,
  },
];

export function SubscriptionModule() {
  return (
    <ModuleCard
      id="pricing"
      letter="B"
      eyebrow="Billing Module"
      title="Subscription Plans"
      description="Transparent pricing that scales with you. 14-day free trial on every plan."
      icon={Package}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 ${
              p.highlight
                ? "border-primary/40 shadow-elevated ring-1 ring-primary/20"
                : "border-border shadow-card"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-coral px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl">{p.price}</span>
              {p.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
            </div>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={`mt-6 ${p.highlight ? "bg-gradient-coral" : ""}`}
              variant={p.highlight ? "default" : "outline"}
            >
              <Link to={p.cta === "Contact Sales" ? "/register" : "/register"}>
                {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Comparison matrix */}
      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl leading-tight">Compare plans</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every feature, side by side. Pick the plan that fits your operation.
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline-flex">
            Feature matrix
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_repeat(3,1fr)] items-center bg-surface px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-6">
            <span>Feature</span>
            <span className="text-center">Basic</span>
            <span className="text-center text-primary">Premium</span>
            <span className="text-center">Enterprise</span>
          </div>

          {[
            ["Digital Menu", true, true, true],
            ["QR Ordering", true, true, true],
            ["Table Ordering", true, true, true],
            ["Single Theme", true, true, true],
            ["Hindi & English", true, true, true],
            ["Online Payments", true, true, true],
            ["Basic Analytics", true, true, true],
            ["Email Notifications", true, true, true],
            ["Kitchen Display", false, true, true],
            ["Multiple Themes", false, true, true],
            ["Advanced Analytics", false, true, true],
          ].map((row, idx) => {
            const [label, s, p, e] = row as [string, boolean, boolean, boolean];
            return (
              <div
                key={label as string}
                className={`grid grid-cols-[1.6fr_repeat(3,1fr)] items-center px-4 py-3.5 text-sm transition-colors hover:bg-surface/60 sm:px-6 ${
                  idx !== 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="pr-2 font-medium text-foreground">{label}</span>
                <Cell on={s} />
                <Cell on={p} highlight />
                <Cell on={e} />
              </div>
            );
          })}
        </div>
      </div>
    </ModuleCard>
  );
}

function Cell({ on, highlight = false }: { on: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {on ? (
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            highlight
              ? "bg-gradient-coral text-primary-foreground shadow-soft"
              : "bg-primary-soft text-primary"
          }`}
          aria-label="Included"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground/60"
          aria-label="Not included"
        >
          <span className="h-[2px] w-3 rounded-full bg-current" />
        </span>
      )}
    </div>
  );
}

/* ============================================================
   C. Services & Features Card
   ============================================================ */
const FEATURES = [
  { icon: QrCode, title: "QR Menus", desc: "Beautiful, instantly updatable menus customers scan at the table." },
  { icon: Clock3, title: "Real-Time Orders", desc: "Live order stream from every table, room, and channel." },
  { icon: ChefHat, title: "Kitchen Display", desc: "Replace paper tickets with a clean, color-coded KDS." },
  { icon: BarChart3, title: "Analytics", desc: "Revenue, top items, peak hours — at a glance." },
  { icon: CreditCard, title: "Payment Tracking", desc: "Reconcile every payment with line-item clarity." },
  { icon: BedDouble, title: "Room Ordering", desc: "Hotel guests order from their room via QR." },
];

export function FeaturesModule() {
  return (
    <ModuleCard
      id="features"
      letter="C"
      eyebrow="Product Module"
      title="Services & Features"
      description="Six focused tools that power service from front-of-house to kitchen to suite."
      icon={LayoutDashboard}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-soft"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-gradient-coral group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </ModuleCard>
  );
}

/* ============================================================
   D. Demo Card
   ============================================================ */
export function DemoModule() {
  return (
    <ModuleCard
      id="demo"
      letter="D"
      eyebrow="Sandbox Module"
      title="Try the Live Demo"
      description="Scan a real demo restaurant menu, preview the experience, and test a full order flow."
      icon={PlayCircle}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Live QR Demo */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Live QR Demo</p>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">Live</span>
          </div>
          <div className="mt-4 grid aspect-square place-items-center rounded-xl bg-card">
            <QrPattern />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Table 12 · Demo Restaurant</p>
          <Button size="sm" variant="outline" className="mt-4 w-full">Scan Demo QR</Button>
        </div>

        {/* Menu Preview */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Menu Preview</p>
            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <p className="font-display text-lg leading-tight">Bella Vita</p>
            <p className="text-[10px] text-muted-foreground">Italian · Downtown</p>
            <div className="mt-3 space-y-2">
              {[
                { n: "Truffle Risotto", p: "$24" },
                { n: "Margherita Pizza", p: "$18" },
                { n: "Tiramisu", p: "$9" },
              ].map((i) => (
                <div key={i.n} className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-2">
                  <span className="text-xs font-medium">{i.n}</span>
                  <span className="text-xs text-primary">{i.p}</span>
                </div>
              ))}
            </div>
          </div>
          <Button size="sm" variant="outline" className="mt-4 w-full">View Menu</Button>
        </div>

        {/* Test Order Flow */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Test Order Flow</p>
            <span className="text-[10px] text-muted-foreground">4 steps</span>
          </div>
          <ol className="mt-4 space-y-3">
            {["Scan QR at table", "Browse digital menu", "Place a test order", "Watch it hit the KDS"].map((s, i) => (
              <li key={s} className="flex items-start gap-3 rounded-xl bg-card px-3 py-2.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
          <Button size="sm" className="mt-auto bg-gradient-coral pt-2.5">Start Test Order</Button>
        </div>
      </div>
    </ModuleCard>
  );
}

function QrPattern() {
  const cells = Array.from({ length: 169 }, (_, i) => (i * 7919) % 100 < 48);
  return (
    <div className="grid w-3/4 gap-[2px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
      {cells.map((on, i) => (
        <div key={i} className={`aspect-square rounded-[1px] ${on ? "bg-foreground" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

/* ============================================================
   E. Social & Contact Card
   ============================================================ */
export function ContactModule() {
  const socials = [
    { icon: Instagram, label: "Instagram", handle: "@paperlessplates" },
    { icon: Linkedin, label: "LinkedIn", handle: "/paperlessplates" },
    { icon: MessageCircle, label: "WhatsApp", handle: "+1 555 0142" },
    { icon: Mail, label: "Email", handle: "hello@paperlessplates.app" },
  ];
  return (
    <ModuleCard
      id="contact"
      letter="E"
      eyebrow="Contact Module"
      title="Social & Contact"
      description="Reach the team, follow the build, or book a guided product demo."
      icon={Users}
      tone="raised"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href="#"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-gradient-coral group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.handle}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-coral p-6 text-primary-foreground lg:col-span-2">
          <div>
            <Calendar className="h-6 w-6" />
            <h3 className="mt-4 font-display text-2xl leading-tight">Book a Demo</h3>
            <p className="mt-2 text-sm text-primary-foreground/90">
              A 20-minute walkthrough tailored to your restaurant or hotel.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="secondary" className="bg-card text-foreground hover:bg-card/90">
              Book Demo
            </Button>
            <Button
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
}

/* ============================================================
   Footer (compact, outside cards)
   ============================================================ */
export function MiniFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-6 pb-10 pt-4">
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          © 2026 PaperlessPlates. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Status</a>
        </div>
      </div>
    </footer>
  );
}
