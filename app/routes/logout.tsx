import { redirect } from "@remix-run/node";
import { supabaseServiceRoleClient } from "~/api/server";

export async function loader() {
    const supabase = supabaseServiceRoleClient()
    supabase.auth.signOut()

    return redirect("/")
}