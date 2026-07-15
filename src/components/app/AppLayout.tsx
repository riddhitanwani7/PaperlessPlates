import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  CreditCard,
  Store,
  Bell,
  ChevronDown,
  LogOut,
  Smartphone,
  Menu as MenuIcon,
  X,
  QrCode,
  ChefHat,
  Armchair,
  BedDouble,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useRole, ROLES, type Role, canAccess, roleHome } from "@/lib/roles";
import { useRestaurant } from "@/components/app/RestaurantProvider";
import { hasFeature } from "@/lib/subscriptionPlans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; labelKey: string; icon: typeof LayoutDashboard; end?: boolean; roles: Role[] };

const nav: NavItem[] = [
  { to: "/app", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true, roles: ["OWNER", "MANAGER"] },
  { to: "/app/analytics", labelKey: "nav.analytics", icon: BarChart3, roles: ["OWNER", "MANAGER"] },
  { to: "/app/orders", labelKey: "nav.orders", icon: ShoppingBag, roles: ["OWNER", "MANAGER", "WAITER", "KITCHEN"] },
  { to: "/app/kitchen", labelKey: "nav.kitchen", icon: ChefHat, roles: ["OWNER", "MANAGER", "KITCHEN"] },
  { to: "/app/menu", labelKey: "nav.menu", icon: UtensilsCrossed, roles: ["OWNER", "MANAGER"] },
  { to: "/app/qr-management", labelKey: "nav.qr", icon: QrCode, roles: ["OWNER", "MANAGER"] },
  { to: "/app/tables", labelKey: "nav.tables", icon: Armchair, roles: ["OWNER", "MANAGER", "WAITER"] },
  { to: "/app/rooms", labelKey: "nav.rooms", icon: BedDouble, roles: ["OWNER", "MANAGER", "WAITER"] },
  { to: "/app/staff", labelKey: "nav.staff", icon: UserCog, roles: ["OWNER"] },
  { to: "/app/subscription", labelKey: "nav.subscription", icon: CreditCard, roles: ["OWNER"] },
  { to: "/app/profile", labelKey: "nav.profile", icon: Store, roles: ["OWNER", "MANAGER"] },
  { to: "/app/preview", labelKey: "nav.preview", icon: Smartphone, roles: ["OWNER", "MANAGER"] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!auth.isAuthed()) {
        navigate({ to: "/login" });
        return;
      }

      try {
        const user = await auth.refreshSession();
        if (cancelled) return;
        console.log(`AppLayout verifySession: User role is ${user.role}, pathname is ${pathname}`);
        // Only OWNER needs onboarding check
        if (user.role === "OWNER" && !user.isOnboarded) {
          navigate({ to: "/onboarding" });
        } else if (user.role === "SUPER_ADMIN") {
          // SUPER_ADMIN goes to platform admin
          if (pathname !== "/platform-admin") {
            console.log(`AppLayout: SUPER_ADMIN on ${pathname}, redirecting to /platform-admin`);
            navigate({ to: "/platform-admin" });
          } else {
            console.log("AppLayout: SUPER_ADMIN on /platform-admin, setting ready");
            setReady(true);
          }
        } else {
          setReady(true);
        }
      } catch {
        if (cancelled) return;
        auth.logout();
        navigate({ to: "/login" });
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [navigate, pathname]);

  // Redirect if role can't access current path
  useEffect(() => {
    if (!ready) return;
    // SUPER_ADMIN doesn't need this check - they have their own routing
    if (role === "SUPER_ADMIN") return;
    
    const base = "/" + pathname.split("/").slice(1, 3).join("/"); // e.g. /app/kitchen
    if (!canAccess(base, role)) {
      navigate({ to: roleHome(role) });
    }
  }, [ready, role, pathname, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar role={role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({ role, mobileOpen, onClose }: { role: Role; mobileOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { restaurant } = useRestaurant();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const planId = restaurant?.selectedPlan;

  // SUPER_ADMIN doesn't see restaurant navigation
  if (role === "SUPER_ADMIN") {
    return null;
  }

  // Filter nav items based on role AND subscription features
  const visible = nav.filter((n) => {
    if (!n.roles.includes(role)) return false;

    // Feature gating for specific routes
    if (n.to === "/app/kitchen" && !hasFeature(planId, "kitchenDisplay")) return false;

    return true;
  });

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/app" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-coral text-primary-foreground font-bold">P</div>
            <span className="font-display text-lg">PaperlessPlates</span>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={onClose} aria-label={t("ui.closeMenu")}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto p-3 pb-32">
          {visible.map((item) => {
            const Icon = item.icon;
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary-soft text-primary font-medium"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{restaurant?.selectedPlan ?? "—"}</p>
          <p className="mt-1">
            {t("ui.role")}: <span className="font-medium text-foreground">{role}</span>
          </p>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = useRole();
  const { restaurant } = useRestaurant();
  const user = auth.getUser();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenu} aria-label={t("ui.openMenu")}>
          <MenuIcon className="h-5 w-5" />
        </button>
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link to="/app/profile">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-medium">{restaurant?.restaurantName ?? "—"}</span>
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={t("ui.notifications")} className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 pr-3 text-sm hover:bg-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-coral text-xs font-semibold text-primary-foreground">{initials}</span>
              <span className="hidden sm:inline">{role}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email ?? t("ui.signedIn")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/app/profile" })}>
              {t("nav.profileMenu")}
            </DropdownMenuItem>
            {import.meta.env.DEV && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <UserCog className="mr-2 h-4 w-4" /> {t("ui.devSwitchRole")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {ROLES.map((r) => (
                      <DropdownMenuItem key={r} onClick={() => {
                        // In dev mode, we can simulate role switching by updating localStorage
                        // This is ONLY for development/testing purposes
                        if (user) {
                          const updatedUser = { ...user, role: r };
                          auth.updateUser(updatedUser);
                          navigate({ to: roleHome(r) });
                        }
                      }}>
                        {r} {role === r && `(${t("ui.current")})`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { auth.logout(); navigate({ to: "/login" }); }}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> {t("nav.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
