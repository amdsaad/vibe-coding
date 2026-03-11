import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || !type) {
    redirect("/sign-in?error=confirmation_failed");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type: type as "signup" | "email",
    token_hash: tokenHash,
  });

  if (error) {
    redirect("/sign-in?error=confirmation_failed");
  }

  redirect("/dashboard");
}
