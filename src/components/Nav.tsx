import Link from "next/link";
import { getCurrentAppUser } from "@/lib/supabase/auth";
import { SignOutButton } from "./SignOutButton";

export async function Nav() {
  const user = await getCurrentAppUser();

  return (
    <header className="bg-brand-navy text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          TalentU
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {user && (
            <>
              <Link href="/library" className="font-medium text-white/90 hover:text-white">
                Library
              </Link>
              <Link href="/my-growth" className="font-medium text-white/90 hover:text-white">
                My Growth
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="font-medium text-white/90 hover:text-white">
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="hidden text-white/60 hover:text-white sm:inline"
              >
                {user.display_name}
              </Link>
              <SignOutButton />
            </>
          )}
          {!user && (
            <Link
              href="/login"
              className="rounded-full bg-brand-red px-4 py-1.5 font-semibold hover:bg-brand-red-dark transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
