import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import {
  RestaurantPortalModule,
  SubscriptionModule,
  FeaturesModule,
  DemoModule,
  ContactModule,
  MiniFooter,
} from "@/components/landing/ModuleCards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaperlessPlates — QR Ordering, KDS & Analytics for Restaurants & Hotels" },
      {
        name: "description",
        content:
          "Go paperless. Serve faster. Earn more. PaperlessPlates is the all-in-one QR menu, real-time order management, kitchen display, and room service platform for restaurants and hotels.",
      },
      { property: "og:title", content: "PaperlessPlates — Modern QR Ordering Platform" },
      {
        property: "og:description",
        content:
          "QR-based digital menus, real-time order management, kitchen displays, analytics, and room service ordering — all in one platform.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      <Nav />
      <main>
        <Hero />
        <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 pt-4 sm:space-y-10">
          <RestaurantPortalModule />
          <SubscriptionModule />
          <FeaturesModule />
          <DemoModule />
          <ContactModule />
        </div>
      </main>
      <MiniFooter />
    </div>
  );
}
