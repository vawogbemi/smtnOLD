import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { supabaseAnonServerClient } from "~/api/server";

export async function loader({request}: LoaderFunctionArgs) {
    const supabase = supabaseAnonServerClient(request)
    await supabase.auth.signOut()

    return redirect("/")
}