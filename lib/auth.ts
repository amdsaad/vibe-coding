import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    return null;
  }

  return data.claims;
}

export async function requireAuth() {
  const claims = await getUser();

  if (!claims) {
    redirect("/sign-in");
  }

  return claims;
}
