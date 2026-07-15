import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { RestaurantProvider } from "@/components/app/RestaurantProvider";
import { RestaurantThemeProvider } from "@/components/app/ThemeProvider";
import { auth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — PaperlessPlates" }] }),
  component: AppRoot,
});

function AppRoot() {
  const navigate = useNavigate();
  const user = auth.getUser();
  
  // SUPER_ADMIN should not access /app routes at all
  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      console.log("AppRoot: SUPER_ADMIN on /app, redirecting to /platform-admin");
      navigate({ to: "/platform-admin", replace: true });
    }
  }, [user, navigate]);
  
  // Don't render anything for SUPER_ADMIN - they'll be redirected
  if (user?.role === "SUPER_ADMIN") {
    return null;
  }
  
  return (
    <RestaurantProvider>
      <RestaurantThemeProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </RestaurantThemeProvider>
    </RestaurantProvider>
  );
}
