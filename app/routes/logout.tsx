import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { supabaseClient } from "~/api/supabase";

export async function loader({request}: LoaderFunctionArgs) {
    const supabase = supabaseClient(request)
    await supabase.auth.signOut()

    return redirect("/")
}