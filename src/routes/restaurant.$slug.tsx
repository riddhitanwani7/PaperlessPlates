import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/restaurant/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Menu` }],
  }),
  component: EntryPage,
});

function EntryPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    navigate({
      to: "/customer/menu",
      search: {
        slug,
        table: params.get("table") ?? undefined,
        room: params.get("room") ?? undefined,
        takeaway: params.get("takeaway") === "true" ? "true" : undefined,
        qr: params.get("qr") ?? undefined,
      },
      replace: true,
    });
  }, [slug, navigate]);

  // Show loading while initializing
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading restaurant...</p>
      </div>
    </div>
  );
}
