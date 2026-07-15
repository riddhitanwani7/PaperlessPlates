import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Menu — PaperlessPlates" }] }),
  component: () => <Outlet />,
});
