import Link from "next/link";
import { getUser } from "@/lib/auth";
import { UserMenu } from "@/components/auth/user-menu";

export async function Navbar() {
  const user = await getUser();

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/90 backdrop-blur-sm border-b border-foreground/5">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-sans font-bold uppercase tracking-wider text-red"
        >
          Vibes
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm font-mono text-foreground/70 hover:text-foreground transition-colors uppercase tracking-wide"
          >
            Explore
          </Link>

          {user ? (
            <UserMenu email={(user as Record<string, unknown>).email as string} />
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-sm font-mono text-foreground/70 hover:text-foreground transition-colors uppercase tracking-wide"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-red px-5 py-2 text-sm font-mono font-medium text-white hover:bg-red-dark transition-colors uppercase tracking-wide"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
