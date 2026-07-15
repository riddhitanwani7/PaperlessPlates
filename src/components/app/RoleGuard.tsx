import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRole, roleHome, type Role } from "@/lib/roles";
import { auth } from "@/lib/auth";

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useRole();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Don't redirect if not authenticated yet
    if (!auth.isAuthed()) {
      setReady(true);
      return;
    }
    
    // Wait for role to be loaded from auth
    const user = auth.getUser();
    if (!user) {
      setReady(true);
      return;
    }
    
    setReady(true);
    if (!allow.includes(role)) {
      console.log(`RoleGuard: Role ${role} not in allowed ${allow}, redirecting to ${roleHome(role)}`);
      navigate({ to: roleHome(role) });
    }
  }, [role, allow, navigate]);
  
  if (!ready) return null;
  if (!allow.includes(role)) return null;
  return <>{children}</>;
}
