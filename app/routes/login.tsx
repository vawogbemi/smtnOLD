import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { SupabaseClient,  } from "@supabase/supabase-js";
import { supabaseAnonServerClient } from "~/api/server";
import { LoginCard } from "~/components/LoginCard/LoginCard";

export async function loader({request}: LoaderFunctionArgs) {
  const supabase = supabaseAnonServerClient(request)
  
  const {data} = await supabase.auth.getSession()

  if (data.session) {
    return redirect("/dashboard")
  }

  return null
}

export default function Login() {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient;
  }>();

  return <LoginCard supabase={supabase} />;
}