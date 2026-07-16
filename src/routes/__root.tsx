import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import "@/i18n";
import { useTranslation } from "react-i18next";

import { Toaster } from "@/components/ui/sonner";
import { setContext, type QRContext } from "@/lib/tableContext";

function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("errors.pageNotFound")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("errors.pageNotFoundDescription")}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("errors.thisPageDidntLoad")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("errors.errorDescription")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("errors.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerContextPreserver />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

type CustomerRouteContext = {
  slug: string;
  table?: string;
  room?: string;
  takeaway?: "true";
  qr?: string;
};

function CustomerContextPreserver() {
  const router = useRouter();
  const location = useRouterState({ select: (state) => state.location });
  const contextRef = useRef<CustomerRouteContext | null>(null);

  useEffect(() => {
    if (!location.pathname.startsWith("/customer/")) return;

    const search = new URLSearchParams(location.searchStr);
    const slug = search.get("slug");

    if (slug) {
      const context: CustomerRouteContext = {
        slug,
        table: search.get("table") ?? undefined,
        room: search.get("room") ?? undefined,
        takeaway: search.get("takeaway") === "true" ? "true" : undefined,
        qr: search.get("qr") ?? undefined,
      };

      contextRef.current = context;

      // The server validates this opaque QR ID and derives the table/room.
      // Query-string labels are only retained for legacy navigation display.
      if (context.qr) {
        const qrContext: QRContext = context.table
          ? { type: "TABLE", qrCodeId: context.qr, tableId: context.table }
          : context.room
            ? { type: "ROOM", qrCodeId: context.qr, roomId: context.room }
            : context.takeaway
              ? { type: "TAKEAWAY", qrCodeId: context.qr }
              : { type: "RESTAURANT", qrCodeId: context.qr };
        setContext(qrContext);
      }
      return;
    }

    if (!contextRef.current) return;

    router.navigate({
      to: location.pathname as never,
      search: contextRef.current,
      replace: true,
    });
  }, [location.pathname, location.searchStr, router]);

  return null;
}
