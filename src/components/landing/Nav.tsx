import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-coral text-primary-foreground shadow-soft">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">PaperlessPlates</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          <a href="#demo" className="transition-colors hover:text-foreground">Live Demo</a>
          <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Admin Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-coral shadow-soft hover:opacity-95">
            <Link to="/register">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
