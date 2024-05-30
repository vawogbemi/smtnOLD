import { Outlet, useOutletContext } from "@remix-run/react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { LoginCard } from "~/components/LoginCard/LoginCard";

export default function Dashboard() {
  const { user, supabase } = useOutletContext<{
    user: User;
    supabase: SupabaseClient;
  }>();
  
  return user ? (
    <Outlet context={{ user, supabase }} />
  ) : (
    <LoginCard supabase={supabase} />
  );
}
