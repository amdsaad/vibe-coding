import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const claims = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", (claims as Record<string, unknown>).sub as string)
    .single();

  if (profile) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-sans font-bold uppercase tracking-wider mb-4">
          Dashboard
        </h1>
        <p className="text-gray font-mono">
          Profile editor coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-sans font-bold uppercase tracking-wider mb-4">
        Create Your Profile
      </h1>
      <p className="text-gray font-mono max-w-md mb-8">
        Set up your portfolio to showcase your work and connect with others.
      </p>
      <Link
        href="/dashboard/profile/create"
        className="rounded-full bg-red px-8 py-3 text-base font-mono font-medium text-white hover:bg-red-dark transition-colors uppercase tracking-wide"
      >
        Get Started
      </Link>
    </div>
  );
}
