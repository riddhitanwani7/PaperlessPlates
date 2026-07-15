import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/theme")({
  beforeLoad: () => {
    throw redirect({ to: "/app/profile", search: { tab: "branding" } });
  },
});
