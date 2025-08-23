import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const loc = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <Link to="/categories" className="text-xl font-semibold tracking-tight">MDprep</Link>
        <nav className="flex items-center gap-2">
          <Link to="/categories" aria-current={loc.pathname === "/categories" ? "page" : undefined}>
            <Button variant={loc.pathname === "/categories" ? "default" : "ghost"}>Categories</Button>
          </Link>
          <Link to="/lists">
            <Button variant={loc.pathname === "/lists" ? "default" : "ghost"}>Flagged/Hard</Button>
          </Link>
          {email ? (
            <Button variant="outline" onClick={() => supabase.auth.signOut()} aria-label="Sign out">
              {email} — Sign out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
