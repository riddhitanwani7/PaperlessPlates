import { Button } from "@/components/ui/button";
import {
  QrCode, Clock3, ChefHat, BarChart3, CreditCard, LayoutGrid,
  BedDouble, Check, Sparkles, Smartphone,
  Instagram, Linkedin, MessageCircle, Mail, ArrowRight, Star,
} from "lucide-react";

/* ------------ Restaurant Portal ------------ */
export function PortalCard() {
  const features = [
    "Manage Digital Menus",
    "Track Orders Live",
    "View Analytics",
    "Manage Tables & Rooms",
    "Kitchen Dashboard",
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-card lg:grid-cols-2 lg:p-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> For Owners & Managers
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Restaurant Portal</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            One command center for everything that happens in your restaurant — from menu changes to live order tracking.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-gradient-coral shadow-soft">Admin Login</Button>
            <Button variant="outline">Manager Login</Button>
          </div>
        </div>
        <ul className="grid gap-3 self-center">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Check className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------ Pricing ------------ */
const PLANS = [
  {
    name: "Basic",
    price: "₹999",
    desc: "For small cafés getting started.",
    features: ["Digital Menu", "QR Ordering", "Table Ordering", "Single Theme", "Hindi & English", "Online Payments", "Basic Analytics"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Premium",
    price: "₹2,499",
    desc: "Most popular for growing restaurants.",
    features: [
      "Everything in Basic",
      "Kitchen Display",
      "Multiple Themes",
      "Advanced Analytics",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For hotels and multi-location groups.",
    features: [
      "Everything in Premium",
      "Dedicated Support",
      "Custom Pricing",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Simple plans that scale with you</h2>
          <p className="mt-4 text-muted-foreground">No hidden fees. Cancel anytime. 14-day free trial on every plan.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border bg-card p-8 transition-all hover:-translate-y-1 ${
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
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl">{p.price}</span>
                {p.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 ${p.highlight ? "bg-gradient-coral" : ""}`}
                variant={p.highlight ? "default" : "outline"}
              >
                {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Features ------------ */
const FEATURES = [
  { icon: QrCode, title: "QR Digital Menus", desc: "Beautiful, instantly updatable menus customers scan at the table." },
  { icon: Clock3, title: "Real-Time Orders", desc: "Live order stream from every table, room, and channel." },
  { icon: ChefHat, title: "Kitchen Display System", desc: "Replace paper tickets with a clean, color-coded KDS." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Revenue, top items, peak hours — at a glance." },
  { icon: CreditCard, title: "Payment Tracking", desc: "Reconcile every payment with line-item clarity." },
  { icon: LayoutGrid, title: "Table Management", desc: "Map your floor and assign orders by table." },
  { icon: BedDouble, title: "Room Service Ordering", desc: "Hotel guests order from their room via QR." },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Platform</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">Everything you need to run service</h2>
        <p className="mt-4 text-muted-foreground">Seven focused tools, one unified platform built for restaurants and hotels.</p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-gradient-coral group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------ Live Demo ------------ */
export function LiveDemo() {
  return (
    <section id="demo" className="bg-surface py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Try it now</span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Try PaperlessPlates Live</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Scan a real demo restaurant menu and place an order — experience exactly what your guests will.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-gradient-coral">Scan Demo QR</Button>
            <Button variant="outline">View Demo Restaurant</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-medium text-muted-foreground">Scan to preview</p>
            <div className="mt-3 grid aspect-square place-items-center rounded-2xl bg-surface">
              <QrPattern />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Table 12 · Demo</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-3 shadow-card">
            <div className="rounded-2xl border border-border bg-surface p-3">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">menu.paperlessplates.app</p>
              </div>
              <p className="mt-3 font-display text-lg leading-tight">Bella Vita</p>
              <p className="text-[10px] text-muted-foreground">Italian · Downtown</p>
              <div className="mt-3 space-y-2">
                {[
                  { n: "Truffle Risotto", p: "₹24" },
                  { n: "Margherita Pizza", p: "₹18" },
                  { n: "Tiramisu", p: "₹9" },
                ].map((i) => (
                  <div key={i.n} className="flex items-center justify-between rounded-lg bg-card px-2.5 py-2">
                    <span className="text-xs font-medium">{i.n}</span>
                    <span className="text-xs text-primary">{i.p}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-3 w-full bg-gradient-coral text-xs">Add to Order</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QrPattern() {
  // Pseudo QR for visual placeholder
  const cells = Array.from({ length: 169 }, (_, i) => (i * 7919) % 100 < 48);
  return (
    <div className="grid w-3/4 grid-cols-13 gap-[2px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
      {cells.map((on, i) => (
        <div key={i} className={`aspect-square rounded-[1px] ${on ? "bg-foreground" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

/* ------------ How it works ------------ */
const STEPS = [
  { n: "01", title: "Register Your Restaurant", desc: "Create an account and add your venue in under 5 minutes." },
  { n: "02", title: "Build Your Digital Menu", desc: "Upload items, photos, and prices with our visual editor." },
  { n: "03", title: "Generate QR Codes", desc: "Download printable QR codes per table or room." },
  { n: "04", title: "Receive Orders Instantly", desc: "Orders land on your KDS and analytics update live." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">From sign-up to first order in minutes</h2>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
            <span className="font-display text-4xl text-primary">{s.n}</span>
            <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------ Social Proof ------------ */
const METRICS = [
  { v: "2,400+", l: "Restaurants Using Platform" },
  { v: "8.2M", l: "Orders Processed" },
  { v: "$184M", l: "Revenue Managed" },
  { v: "42", l: "Cities Served" },
];
const TESTIMONIALS = [
  { name: "Sara Ahmed", role: "Owner, Bella Vita", quote: "We cut order errors by 70% in the first month. Setup was genuinely 10 minutes." },
  { name: "Daniel Park", role: "GM, Hotel Lumen", quote: "Room service orders went up 3× since switching. Guests love the in-room QR." },
  { name: "Maya Patel", role: "Director, Spice Group", quote: "Finally one dashboard for all our locations. The analytics are gorgeous." },
];

export function SocialProof() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.l} className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <p className="font-display text-4xl text-primary sm:text-5xl">{m.v}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Contact Card ------------ */
export function ContactCard() {
  const socials = [
    { icon: Instagram, label: "Instagram", handle: "@paperlessplates" },
    { icon: Linkedin, label: "LinkedIn", handle: "/paperlessplates" },
    { icon: MessageCircle, label: "WhatsApp", handle: "+1 555 0142" },
    { icon: Mail, label: "Email", handle: "hello@paperlessplates.app" },
  ];
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-16">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="grid gap-0 lg:grid-cols-5">
          <div className="bg-gradient-coral p-10 text-primary-foreground lg:col-span-2">
            <h3 className="font-display text-4xl leading-tight">Let's talk.</h3>
            <p className="mt-3 text-primary-foreground/90">
              Whether you're opening your first café or running a hotel group — we'd love to hear from you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-card text-foreground hover:bg-card/90">Follow Us</Button>
              <Button variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                Book Demo
              </Button>
              <Button variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                Contact Sales
              </Button>
            </div>
          </div>
          <div className="grid gap-3 p-10 sm:grid-cols-2 lg:col-span-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
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
        </div>
      </div>
    </section>
  );
}

/* ------------ Final CTA ------------ */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center shadow-elevated sm:p-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,oklch(0.96_0.05_25)_0%,transparent_100%)]" />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-5xl leading-tight sm:text-6xl">
            Ready to Go <span className="text-primary">Paperless?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join restaurants and hotels serving smarter.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-gradient-coral shadow-elevated">
              Create Free Account <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">Schedule Demo</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------ Footer ------------ */
export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">© 2026 PaperlessPlates. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Status</a>
        </div>
      </div>
    </footer>
  );
}
