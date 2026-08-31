import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();

  // Defense in depth — middleware already redirects non-admins away from /admin.
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <div className="border-b border-black/10 bg-white">
        <nav className="mx-auto flex max-w-6xl gap-6 px-4 py-3 text-sm font-medium text-black/60">
          <Link href="/admin" className="hover:text-brand-navy">
            Dashboard
          </Link>
          <Link href="/admin/resources" className="hover:text-brand-navy">
            Resources
          </Link>
          <Link href="/admin/categories" className="hover:text-brand-navy">
            Categories
          </Link>
          <Link href="/admin/users" className="hover:text-brand-navy">
            Team members
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
