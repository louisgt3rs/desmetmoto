import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveAdminState = async (nextSession: Session | null) => {
      if (!isMounted) return;
      setLoading(true);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: nextSession.user.id,
          _role: "admin",
        });
        if (isMounted) setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }

      if (isMounted) setLoading(false);
    };

    // Restore session from storage FIRST
    supabase.auth.getSession().then(({ data: { session } }) => {
      void resolveAdminState(session);
    });

    // Then listen for subsequent changes, skipping the initial event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION") return; // already handled above
        void resolveAdminState(session);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, signIn, signOut };
}
