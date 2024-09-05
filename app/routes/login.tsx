import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { SupabaseClient,  } from "@supabase/supabase-js";
import { supabaseClient } from "~/api/supabase";
import { LoginCard } from "~/components/Misc/LoginCard/LoginCard";

export async function loader({request}: LoaderFunctionArgs) {
  const supabase = supabaseClient(request)
  
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