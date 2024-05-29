import { useOutletContext } from "@remix-run/react";
import { SupabaseClient,  } from "@supabase/supabase-js";
import { LoginCard } from "~/components/LoginCard/LoginCard";

export default function Login() {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient;
  }>();

  return <LoginCard supabase={supabase} />;
}